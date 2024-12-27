import { Injectable, OnModuleInit } from '@nestjs/common';
import { debounceTime, merge } from 'rxjs';
import { In } from 'typeorm';
import { camelCase } from 'typeorm/util/StringUtils.js';
import { ConfigurableOperation, CreateCollectionInput, MoveCollectionInput, UpdateCollectionInput } from '../../api';
import {
    assertFound,
    EntityNotFoundError,
    ID,
    idsAreEqual,
    IllegalOperationError,
    JobState,
    RequestContext,
    SerializedRequestContext,
    Type,
} from '../../common';
import { pick } from '../../common/utils/pick';
import { ConfigService, Logger } from '../../config';
import { TransactionalConnection } from '../../connection';
import { FirelancerEntity, JobPost } from '../../entity';
import { Collection } from '../../entity/collection/collection.entity';
import { EventBus, FirelancerEvent, JobPostEvent } from '../../event-bus';
import { CollectionEvent } from '../../event-bus/events/collection-event';
import { CollectionModificationEvent } from '../../event-bus/events/collection-modification-event';
import { JobQueue, JobQueueService } from '../../job-queue';
import { ConfigArgService } from '../helpers/config-arg/config-arg.service';
import { moveToIndex } from '../helpers/utils/move-to-index';
import { patchEntity } from '../helpers/utils/patch-entity';

export type CollectableEntity<Entity extends FirelancerEntity, Event extends FirelancerEvent> = {
    entityType: Type<Entity>;
    entityEvent: Type<Event>;
};

export const collectableEntities: CollectableEntity<any, any>[] = [
    {
        entityType: JobPost,
        entityEvent: JobPostEvent,
    },
];

export type ApplyCollectionFiltersJobData = {
    ctx: SerializedRequestContext;
    collectionIds: ID[];
    entityName: string;
    applyToChangedEntitiesOnly?: boolean;
};

/**
 * @description
 * Contains methods relating to Collection entities.
 */
@Injectable()
export class CollectionService implements OnModuleInit {
    private rootCollection: Collection | undefined;
    private applyFiltersQueue: JobQueue<ApplyCollectionFiltersJobData>;

    constructor(
        private connection: TransactionalConnection,
        private configArgService: ConfigArgService,
        private eventBus: EventBus,
        private configService: ConfigService,
        private jobQueueService: JobQueueService,
    ) {}

    async onModuleInit() {
        for (const { entityType, entityEvent } of collectableEntities) {
            merge(this.eventBus.ofType(entityEvent))
                .pipe(debounceTime(50))
                .subscribe(async (event) => {
                    const collections = await this.connection.rawConnection.getRepository(Collection).find({ select: { id: true } });
                    await this.applyFiltersQueue.add(
                        {
                            ctx: event.ctx.serialize(),
                            collectionIds: collections.map((c) => c.id),
                            applyToChangedEntitiesOnly: true,
                            entityName: entityType.name,
                        },
                        { ctx: event.ctx },
                    );
                });
        }

        this.applyFiltersQueue = await this.jobQueueService.createQueue({
            name: 'apply-collection-filters',
            process: async (job) => {
                const ctx = RequestContext.deserialize(job.data.ctx);
                Logger.verbose(`Processing ${job.data.collectionIds.length} Collections`);
                let completed = 0;
                for (const collectionId of job.data.collectionIds) {
                    if (job.state === JobState.CANCELLED) {
                        throw new Error(`Job was cancelled`);
                    }
                    let collection: Collection | undefined;
                    try {
                        collection = await this.connection.getEntityOrThrow(ctx, Collection, collectionId, {
                            retries: 5,
                            retryDelay: 50,
                        });
                    } catch (err) {
                        Logger.warn(`Could not find Collection with id ${collectionId}, skipping`);
                    }
                    completed++;
                    if (collection !== undefined) {
                        let affectedJobPostIds: ID[] = [];
                        try {
                            const entity = collectableEntities.find((e) => e.entityType.name === job.data.entityName);
                            if (!entity) {
                                throw new Error(`Entity "${job.data.entityName}" not found`);
                            }

                            affectedJobPostIds = await this.applyCollectionFiltersInternal(
                                collection,
                                entity.entityType,
                                job.data.applyToChangedEntitiesOnly,
                            );
                        } catch (e: unknown) {
                            Logger.error(
                                `An error occurred when processing the filters for the collection "${collection.name}" (id: ${collection.id})`,
                            );
                            if (e instanceof Error) {
                                Logger.error(e.message);
                            }
                            continue;
                        }
                        job.setProgress(Math.ceil((completed / job.data.collectionIds.length) * 100));
                        if (affectedJobPostIds.length) {
                            // To avoid performance issues on huge collections we first split the affected job-post ids into chunks
                            this.chunkArray(affectedJobPostIds, 50000).map((chunk) =>
                                this.eventBus.publish(new CollectionModificationEvent(ctx, collection, chunk)),
                            );
                        }
                    }
                }
            },
        });
    }

    async findAll(ctx: RequestContext): Promise<Collection[]> {
        return this.connection.getTreeRepository(ctx, Collection).findTrees();
    }

    async findOne(ctx: RequestContext, collectionId: ID): Promise<Collection | undefined> {
        return this.connection
            .getRepository(ctx, Collection)
            .findOne({
                where: { id: collectionId },
            })
            .then((result) => result ?? undefined);
    }

    async getParent(ctx: RequestContext, collectionId: ID): Promise<Collection | undefined> {
        const parent = await this.connection
            .getRepository(ctx, Collection)
            .createQueryBuilder('collection')
            .where(
                (qb) =>
                    `collection.id = ${qb
                        .subQuery()
                        .select(`${qb.escape('child')}.${qb.escape('parentId')}`)
                        .from(Collection, 'child')
                        .where('child.id = :id', { id: collectionId })
                        .getQuery()}`,
            )
            .getOne();

        return parent ?? undefined;
    }

    /**
     * @description
     * Returns all child Collections of the Collection with the given id.
     */
    async getChildren(ctx: RequestContext, collectionId: ID): Promise<Collection[]> {
        return this.getDescendants(ctx, collectionId, 1);
    }

    /**
     * @description
     * Returns an array of name/id pairs representing all ancestor Collections up
     * to the Root Collection.
     */
    async getBreadcrumbs(ctx: RequestContext, collection: Collection): Promise<Array<{ name: string; id: ID; slug: string }>> {
        const rootCollection = await this.getRootCollection(ctx);
        if (idsAreEqual(collection.id, rootCollection.id)) {
            return [pick(rootCollection, ['id', 'name', 'slug'])];
        }
        const pickProps = pick(['id', 'name', 'slug']);
        const ancestors = await this.getAncestors(collection.id, ctx);
        if (collection.name == null || collection.slug == null) {
            collection = await this.connection.getEntityOrThrow(ctx, Collection, collection.id);
        }
        return [pickProps(rootCollection), ...ancestors.map(pickProps).reverse(), pickProps(collection)];
    }

    /**
     * @description
     * Returns the descendants of a Collection as a flat array. The depth of the traversal can be limited
     * with the maxDepth argument. So to get only the immediate children, set maxDepth = 1.
     */
    async getDescendants(ctx: RequestContext, rootId: ID, maxDepth: number = Number.MAX_SAFE_INTEGER): Promise<Array<Collection>> {
        const getChildren = async (id: ID, _descendants: Collection[] = [], depth = 1) => {
            const children = await this.connection
                .getRepository(ctx, Collection)
                .find({ where: { parent: { id } }, order: { position: 'ASC' } });
            for (const child of children) {
                _descendants.push(child);
                if (depth < maxDepth) {
                    await getChildren(child.id, _descendants, depth++);
                }
            }
            return _descendants;
        };

        const descendants = await getChildren(rootId);
        return descendants;
    }

    /**
     * @description
     * Gets the ancestors of a given collection.
     */
    getAncestors(collectionId: ID): Promise<Collection[]>;
    getAncestors(collectionId: ID, ctx: RequestContext): Promise<Array<Collection>>;
    async getAncestors(collectionId: ID, ctx?: RequestContext): Promise<Array<Collection>> {
        const getParent = async (id: ID, _ancestors: Collection[] = []): Promise<Collection[]> => {
            const parent = await this.connection
                .getRepository(ctx, Collection)
                .createQueryBuilder()
                .relation(Collection, 'parent')
                .of(id)
                .loadOne();
            if (parent) {
                if (!parent.isRoot) {
                    _ancestors.push(parent);
                    return getParent(parent.id, _ancestors);
                }
            }
            return _ancestors;
        };
        const ancestors = await getParent(collectionId);

        return this.connection
            .getRepository(ctx, Collection)
            .find({ where: { id: In(ancestors.map((c) => c.id)) } })
            .then((categories) => {
                const resultCategories: Array<Collection> = [];
                ancestors.forEach((a) => {
                    const category = categories.find((c) => c.id === a.id);
                    if (category) {
                        resultCategories.push(category);
                    }
                });
                return resultCategories;
            });
    }

    async create(ctx: RequestContext, input: CreateCollectionInput): Promise<Collection> {
        const collection = new Collection(input);
        const parent = await this.getParentCollection(ctx, input.parentId);
        if (parent) {
            collection.parent = parent;
        }
        collection.position = await this.getNextPositionInParent(ctx, input.parentId || undefined);
        collection.filters = this.getCollectionFiltersFromInput(input);
        await this.connection.getRepository(ctx, Collection).save(collection);

        for (const { entityType } of collectableEntities) {
            await this.applyFiltersQueue.add(
                {
                    ctx: ctx.serialize(),
                    collectionIds: [collection.id],
                    entityName: entityType.name,
                },
                { ctx },
            );
        }

        await this.eventBus.publish(new CollectionEvent(ctx, collection, 'created', input));
        return assertFound(this.findOne(ctx, collection.id));
    }

    async update(ctx: RequestContext, input: UpdateCollectionInput): Promise<Collection> {
        const collection = await this.findOne(ctx, input.id);
        if (!collection) {
            throw new EntityNotFoundError('Collection', input.id);
        }
        const updatedCollection = patchEntity(collection, input);
        await this.connection.getRepository(ctx, Collection).save(updatedCollection, { reload: false });

        if (input.filters) {
            for (const { entityType } of collectableEntities) {
                await this.applyFiltersQueue.add(
                    {
                        ctx: ctx.serialize(),
                        collectionIds: [collection.id],
                        entityName: entityType.name,
                        applyToChangedEntitiesOnly: false,
                    },
                    { ctx },
                );
            }
        } else {
            const affectedJobPostIds = await this.getCollectionJobPostIds(collection);
            await this.eventBus.publish(new CollectionModificationEvent(ctx, collection, affectedJobPostIds));
        }
        await this.eventBus.publish(new CollectionEvent(ctx, updatedCollection, 'updated', input));
        return assertFound(this.findOne(ctx, collection.id));
    }

    async delete(ctx: RequestContext, id: ID): Promise<void> {
        const collection = await this.connection.getEntityOrThrow(ctx, Collection, id);
        const descendants = await this.getDescendants(ctx, collection.id);
        const deletedCollection = new Collection(collection);

        for (const coll of [...descendants.reverse(), collection]) {
            const affectedJobPostIds = await this.getCollectionJobPostIds(coll);
            const deletedColl = new Collection(coll);
            // To avoid performance issues on huge collections, we first delete the links
            // between the job-posts and the collection by chunks
            const chunkedDeleteIds = this.chunkArray(affectedJobPostIds, 500);
            for (const chunkedDeleteId of chunkedDeleteIds) {
                await this.connection.rawConnection
                    .createQueryBuilder()
                    .relation(Collection, 'jobPosts')
                    .of(collection)
                    .remove(chunkedDeleteId);
            }
            await this.connection.getRepository(ctx, Collection).remove(coll);
            await this.eventBus.publish(new CollectionModificationEvent(ctx, deletedColl, affectedJobPostIds));
        }
        await this.eventBus.publish(new CollectionEvent(ctx, deletedCollection, 'deleted', id));
    }

    /**
     * @description
     * Moves a Collection by specifying the parent Collection ID, and an index representing the order amongst
     * its siblings.
     */
    async move(ctx: RequestContext, input: MoveCollectionInput): Promise<Collection> {
        const target = await this.connection.getEntityOrThrow(ctx, Collection, input.collectionId);
        const descendants = await this.getDescendants(ctx, input.collectionId);

        if (idsAreEqual(input.parentId, target.id) || descendants.some((cat) => idsAreEqual(input.parentId, cat.id))) {
            throw new IllegalOperationError('error.cannot-move-collection-into-self');
        }

        let siblings = await this.connection
            .getRepository(ctx, Collection)
            .createQueryBuilder('collection')
            .leftJoin('collection.parent', 'parent')
            .where('parent.id = :id', { id: input.parentId })
            .getMany();

        if (!idsAreEqual(target.parentId, input.parentId)) {
            target.parent = new Collection({ id: input.parentId });
        }
        siblings = moveToIndex(input.index, target, siblings);

        await this.connection.getRepository(ctx, Collection).save(siblings);
        for (const { entityType } of collectableEntities) {
            await this.applyFiltersQueue.add(
                {
                    ctx: ctx.serialize(),
                    collectionIds: [target.id],
                    entityName: entityType.name,
                },
                { ctx },
            );
        }
        return assertFound(this.findOne(ctx, input.collectionId));
    }

    private getCollectionFiltersFromInput(input: CreateCollectionInput | UpdateCollectionInput): ConfigurableOperation[] {
        const filters: ConfigurableOperation[] = [];
        if (input.filters) {
            for (const filter of input.filters) {
                filters.push(this.configArgService.parseInput('CollectionFilter', filter));
            }
        }
        return filters;
    }

    private chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
        const results = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            results.push(array.slice(i, i + chunkSize));
        }

        return results;
    };

    private async applyCollectionFiltersInternal(
        collection: Collection,
        entityType: Type<any>,
        applyToChangedEntitiesOnly = true,
    ): Promise<ID[]> {
        const masterConnection = this.connection.rawConnection.createQueryRunner('master').connection;
        const ancestorFilters = await this.getAncestorFilters(collection);
        const filters = [...ancestorFilters, ...(collection.filters || [])];
        const { collectionFilters } = this.configService.catalogOptions;

        // Create a basic query to retrieve the IDs of entities that match the collection filters
        let filteredQb = masterConnection
            .getRepository(entityType)
            .createQueryBuilder('entity')
            .select('entity.id', 'id')
            .setFindOptions({ loadEagerRelations: false });

        // If there are no filters, ensure the query returns no results
        if (filters.length === 0) {
            filteredQb.andWhere('1 = 0');
        }

        //  Applies the CollectionFilters and returns an array of entity instances which match
        for (const filterType of collectionFilters) {
            if (filterType.entityType.name == entityType.name) {
                const filtersOfType = filters.filter((f) => f.code === filterType.code);
                if (filtersOfType.length) {
                    for (const filter of filtersOfType) {
                        filteredQb = filterType.apply(filteredQb, filter.args);
                    }
                }
            }
        }

        // Subquery for existing entities in the collection
        const existingEntitiesQb = masterConnection
            .getRepository(entityType)
            .createQueryBuilder('entity')
            .select('entity.id', 'id')
            .setFindOptions({ loadEagerRelations: false })
            .innerJoin(`entity.collections`, 'collection', 'collection.id = :id', { id: collection.id });

        // Using CTE to find entities to add
        const addQb = masterConnection
            .createQueryBuilder()
            .addCommonTableExpression(filteredQb, '_filtered_entities')
            .addCommonTableExpression(existingEntitiesQb, '_existing_entities')
            .select('filtered_entities.id')
            .from('_filtered_entities', 'filtered_entities')
            .leftJoin('_existing_entities', 'existing_entities', 'filtered_entities.id = existing_entities.id')
            .where('existing_entities.id IS NULL');

        // Using CTE to find the entities to be deleted
        const removeQb = masterConnection
            .createQueryBuilder()
            .addCommonTableExpression(filteredQb, '_filtered_entities')
            .addCommonTableExpression(existingEntitiesQb, '_existing_entities')
            .select('existing_entities.id')
            .from('_existing_entities', 'existing_entities')
            .leftJoin('_filtered_entities', 'filtered_entities', 'existing_entities.id = filtered_entities.id')
            .where('filtered_entities.id IS NULL')
            .setParameters({ id: collection.id });

        const [toAddIds, toRemoveIds] = await Promise.all([
            addQb.getRawMany().then((results) => results.map((result) => result.id)),
            removeQb.getRawMany().then((results) => results.map((result) => result.id)),
        ]);

        try {
            const entityRelation = `${camelCase(entityType.name)}s`;
            await this.connection.rawConnection.transaction(async (transactionalEntityManager) => {
                const chunkedDeleteIds = this.chunkArray(toRemoveIds, 5000);
                const chunkedAddIds = this.chunkArray(toAddIds, 5000);
                await Promise.all([
                    // Delete entities that should no longer be in the collection
                    ...chunkedDeleteIds.map((chunk) =>
                        transactionalEntityManager.createQueryBuilder().relation(Collection, entityRelation).of(collection).remove(chunk),
                    ),
                    // Add entities that should be in the collection
                    ...chunkedAddIds.map((chunk) =>
                        transactionalEntityManager.createQueryBuilder().relation(Collection, entityRelation).of(collection).add(chunk),
                    ),
                ]);
            });
        } catch (e) {
            if (e instanceof Error) {
                Logger.error(e.message);
            }
        }

        if (applyToChangedEntitiesOnly) {
            return [...toAddIds, ...toRemoveIds];
        }

        return [...(await existingEntitiesQb.getRawMany().then((results) => results.map((result) => result.id))), ...toRemoveIds];
    }

    /**
     * Returns the IDs of the Collection's JobPosts.
     */
    async getCollectionJobPostIds(collection: Collection, ctx?: RequestContext): Promise<ID[]> {
        if (collection.jobPosts) {
            return collection.jobPosts.map((jobPost) => jobPost.id);
        } else {
            const jobPosts = await this.connection.getRepository(ctx, JobPost).find({
                where: {
                    collections: {
                        id: collection.id,
                    },
                },
            });
            return jobPosts.map((jobPost) => jobPost.id);
        }
    }

    /**
     * Gets all filters of ancestor Collections while respecting the `inheritFilters` setting of each.
     * As soon as `inheritFilters === false` is encountered, the collected filters are returned.
     */
    private async getAncestorFilters(collection: Collection): Promise<ConfigurableOperation[]> {
        const ancestorFilters: ConfigurableOperation[] = [];
        if (collection.inheritFilters) {
            const ancestors = await this.getAncestors(collection.id);
            for (const ancestor of ancestors) {
                ancestorFilters.push(...ancestor.filters);
                if (ancestor.inheritFilters === false) {
                    return ancestorFilters;
                }
            }
        }
        return ancestorFilters;
    }

    /**
     * Returns the next position value in the given parent collection.
     */
    private async getNextPositionInParent(ctx: RequestContext, maybeParentId?: ID): Promise<number> {
        const parentId = maybeParentId || (await this.getRootCollection(ctx)).id;
        const result = await this.connection
            .getRepository(ctx, Collection)
            .createQueryBuilder('collection')
            .leftJoin('collection.parent', 'parent')
            .select('MAX(collection.position)', 'index')
            .where('parent.id = :id', { id: parentId })
            .getRawOne();
        const index = result.index;
        return (typeof index === 'number' ? index : 0) + 1;
    }

    private async getParentCollection(ctx: RequestContext, parentId?: ID | null): Promise<Collection | undefined> {
        if (parentId) {
            return this.connection
                .getRepository(ctx, Collection)
                .createQueryBuilder('collection')
                .where('collection.id = :id', { id: parentId })
                .getOne()
                .then((result) => result ?? undefined);
        } else {
            return this.getRootCollection(ctx);
        }
    }

    private async getRootCollection(ctx: RequestContext): Promise<Collection> {
        const cachedRoot = this.rootCollection;

        if (cachedRoot) {
            return cachedRoot;
        }

        const existingRoot = await this.connection
            .getRepository(ctx, Collection)
            .createQueryBuilder('collection')
            .where('collection.isRoot = :isRoot', { isRoot: true })
            .getOne();

        if (existingRoot) {
            this.rootCollection = existingRoot;
            return this.rootCollection;
        }

        const newRoot = await this.connection.rawConnection.getRepository(Collection).save(
            new Collection({
                slug: 'default-collection',
                name: 'Default Collection',
                description: 'Default Collection',
                isRoot: true,
                position: 0,
                filters: [],
            }),
        );
        this.rootCollection = newRoot;
        return this.rootCollection;
    }
}
