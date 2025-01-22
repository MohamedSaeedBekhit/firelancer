import { assertFound, ID, PaginatedList, unique } from '@firelancer/common';
import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { CreateJobPostInput, RelationPaths } from '../../api';
import { ListQueryOptions, RequestContext } from '../../common';
import { TransactionalConnection } from '../../connection';
import { JobPost } from '../../entity';
import { EventBus, JobPostEvent } from '../../event-bus';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { AssetService } from './asset.service';
import { FacetValueService } from './facet-value.service';

@Injectable()
export class JobPostService {
    private readonly relations = ['assets', 'facetValues', 'facetValues.facet'];

    constructor(
        private connection: TransactionalConnection,
        private assetService: AssetService,
        private facetValueService: FacetValueService,
        private eventBus: EventBus,
        private listQueryBuilder: ListQueryBuilder,
    ) {}

    async findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<JobPost>,
        relations?: RelationPaths<JobPost>,
    ): Promise<PaginatedList<JobPost>> {
        const effectiveRelations = relations || this.relations.slice();
        const customPropertyMap: { [name: string]: string } = {};

        return this.listQueryBuilder
            .build(JobPost, options, {
                relations: effectiveRelations,
                where: { deletedAt: IsNull() },
                ctx,
                customPropertyMap,
            })
            .getManyAndCount()
            .then(async ([items, totalItems]) => ({
                items,
                totalItems,
            }));
    }

    async findOne(
        ctx: RequestContext,
        jobPostId: ID,
        relations?: RelationPaths<JobPost>,
    ): Promise<JobPost | undefined> {
        const effectiveRelations = relations ?? this.relations.slice();
        if (relations && effectiveRelations.includes('facetValues')) {
            // We need the facet to determine with the FacetValues are public
            // when serving via the Shop API.
            effectiveRelations.push('facetValues.facet');
        }

        return this.connection
            .getRepository(ctx, JobPost)
            .findOne({
                relations: unique(effectiveRelations),
                where: {
                    id: jobPostId,
                    deletedAt: IsNull(),
                },
            })
            .then((result) => result ?? undefined);
    }

    async create(ctx: RequestContext, input: CreateJobPostInput): Promise<JobPost> {
        const { assetIds, facetValueIds, ...rest } = input;

        const jobPost = new JobPost(rest);
        jobPost.facetValues = await this.facetValueService.findByIds(ctx, facetValueIds || []);
        await this.connection.getRepository(ctx, JobPost).save(jobPost);
        await this.assetService.updateEntityAssets(ctx, jobPost, { assetIds });

        await this.eventBus.publish(new JobPostEvent(ctx, jobPost, 'created', rest));
        return assertFound(this.findOne(ctx, jobPost.id));
    }
}
