import { assertFound } from '@firelancer/common/lib/shared-utils';
import { PaginatedList } from '@firelancer/common/lib/shared-types';
import { Injectable } from '@nestjs/common';
import { In, IsNull } from 'typeorm';
import { RelationPaths } from '../../api';
import { ListQueryOptions, RequestContext, Translated } from '../../common';
import { CreateFacetValueInput, ID, UpdateFacetValueInput } from '../../common/shared-schema';
import { TransactionalConnection } from '../../connection';
import { FacetValueTranslation, JobPost } from '../../entity';
import { FacetValue } from '../../entity/facet-value/facet-value.entity';
import { EventBus } from '../../event-bus';
import { FacetValueEvent } from '../../event-bus/events/facet-value-event';
import { ListQueryBuilder, TranslatableSaver, TranslatorService } from '../../service';

/**
 * @description
 * Contains methods relating to FacetValue entities.
 */
@Injectable()
export class FacetValueService {
    constructor(
        private connection: TransactionalConnection,
        private eventBus: EventBus,
        private translatableSaver: TranslatableSaver,
        private translator: TranslatorService,
        private listQueryBuilder: ListQueryBuilder,
    ) {}

    async findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<FacetValue>,
        relations?: RelationPaths<FacetValue>,
    ): Promise<PaginatedList<Translated<FacetValue>>> {
        return this.listQueryBuilder
            .build(FacetValue, options, {
                ctx,
                relations: relations ?? ['facet'],
            })
            .getManyAndCount()
            .then(([items, totalItems]) => {
                return {
                    items: items.map((item) => this.translator.translate(item, ctx, ['facet'])),
                    totalItems,
                };
            });
    }

    async findOne(ctx: RequestContext, id: ID): Promise<Translated<FacetValue> | undefined> {
        const facetValue = await this.connection.getRepository(ctx, FacetValue).findOne({
            where: { id },
            relations: ['facet'],
        });

        if (!facetValue) {
            return;
        }

        return this.translator.translate(facetValue, ctx, ['facet']);
    }

    async findByIds(ctx: RequestContext, ids: ID[]): Promise<Array<Translated<FacetValue>>> {
        if (ids.length === 0) {
            return [];
        }
        const facetValues = await this.connection.getRepository(ctx, FacetValue).find({
            where: { id: In(ids) },
            relations: { facet: true },
        });

        return facetValues.map((facetValue) => this.translator.translate(facetValue, ctx, ['facet']));
    }

    /**
     * @description
     * Returns all FacetValues belonging to the Facet with the given id.
     */
    async findByFacetId(
        ctx: RequestContext,
        id: ID,
        options?: ListQueryOptions<FacetValue>,
        relations?: RelationPaths<FacetValue>,
    ): Promise<PaginatedList<Translated<FacetValue>>> {
        return this.listQueryBuilder
            .build(FacetValue, options, {
                ctx,
                relations: relations ?? ['facet'],
                entityAlias: 'facetValue',
            })
            .andWhere('facetValue.facetId = :id', { id })
            .getManyAndCount()
            .then(([items, totalItems]) => {
                return {
                    items: items.map((item) => this.translator.translate(item, ctx, ['facet'])),
                    totalItems,
                };
            });
    }

    async create(ctx: RequestContext, input: CreateFacetValueInput): Promise<Translated<FacetValue>> {
        const facetValue = await this.translatableSaver.create({
            ctx,
            input,
            entityType: FacetValue,
            translationType: FacetValueTranslation,
        });

        await this.eventBus.publish(new FacetValueEvent(ctx, facetValue, 'created', input));
        return assertFound(this.findOne(ctx, facetValue.id));
    }

    async update(ctx: RequestContext, input: UpdateFacetValueInput): Promise<Translated<FacetValue>> {
        const facetValue = await this.translatableSaver.update({
            ctx,
            input,
            entityType: FacetValue,
            translationType: FacetValueTranslation,
        });
        await this.eventBus.publish(new FacetValueEvent(ctx, facetValue, 'updated', input));
        return assertFound(this.findOne(ctx, facetValue.id));
    }

    async delete(ctx: RequestContext, id: ID, force: boolean = false): Promise<void> {
        const { jobPostsCount } = await this.checkFacetValueUsage(ctx, [id]);
        const hasUsages = !!jobPostsCount;
        const facetValue = await this.connection.getEntityOrThrow(ctx, FacetValue, id);
        // Create a new facetValue so that the id is still available
        // after deletion (the .remove() method sets it to undefined)
        const deletedFacetValue = new FacetValue(facetValue);
        if (hasUsages && !force) {
            throw new Error('message.asset-to-be-deleted-is-in-use');
        }
        await this.connection.getRepository(ctx, FacetValue).remove(facetValue);
        await this.eventBus.publish(new FacetValueEvent(ctx, deletedFacetValue, 'deleted', id));
    }

    /**
     * @description
     * Checks for usage of the given FacetValues in any JobPosts, and returns the counts.
     */
    async checkFacetValueUsage(ctx: RequestContext, facetValueIds: ID[]): Promise<{ jobPostsCount: number }> {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const [jobPosts, jobPostsCount] = await this.connection.getRepository(ctx, JobPost).findAndCount({
            where: {
                facetValues: {
                    id: In(facetValueIds),
                },
                deletedAt: IsNull(),
            },
        });

        return { jobPostsCount };
    }
}
