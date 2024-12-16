import { Injectable } from '@nestjs/common';
import { EntityNotFoundError, In, IsNull } from 'typeorm';
import { CreateFacetValueInput, UpdateFacetValueInput } from '../../api';
import { assertFound, ID, RequestContext } from '../../common';
import { TransactionalConnection } from '../../connection';
import { JobPost } from '../../entity';
import { FacetValue } from '../../entity/facet-value/facet-value.entity';
import { EventBus } from '../../event-bus';
import { FacetValueEvent } from '../../event-bus/events/facet-value-event';
import { patchEntity } from '../helpers/utils/patch-entity';

/**
 * @description
 * Contains methods relating to FacetValue entities.
 */
@Injectable()
export class FacetValueService {
  constructor(
    private connection: TransactionalConnection,
    private eventBus: EventBus,
  ) {}

  async findAll(ctx: RequestContext): Promise<FacetValue[]> {
    return this.connection.getRepository(ctx, FacetValue).find({
      relations: { facet: true },
    });
  }

  async findOne(ctx: RequestContext, id: ID): Promise<FacetValue | undefined> {
    return this.connection
      .getRepository(ctx, FacetValue)
      .findOne({
        where: { id },
        relations: { facet: true },
      })
      .then((result) => result ?? undefined);
  }

  async findByIds(ctx: RequestContext, ids: ID[]): Promise<FacetValue[]> {
    if (ids.length === 0) {
      return [];
    }
    const facetValues = await this.connection.getRepository(ctx, FacetValue).find({
      where: { id: In(ids) },
      relations: { facet: true },
    });
    return facetValues;
  }

  /**
   * @description
   * Returns all FacetValues belonging to the Facet with the given id.
   */
  async findByFacetId(ctx: RequestContext, id: ID): Promise<FacetValue[]> {
    return this.connection.getRepository(ctx, FacetValue).find({
      where: { facet: { id } },
      relations: { facet: true },
    });
  }

  async create(ctx: RequestContext, input: CreateFacetValueInput): Promise<FacetValue> {
    const facetValue = new FacetValue(input);
    await this.connection.getRepository(ctx, FacetValue).save(facetValue);
    await this.eventBus.publish(new FacetValueEvent(ctx, facetValue, 'created', input));
    return assertFound(this.findOne(ctx, facetValue.id));
  }

  async update(ctx: RequestContext, input: UpdateFacetValueInput): Promise<FacetValue> {
    const facetValue = await this.findOne(ctx, input.id);
    if (!facetValue) {
      throw new EntityNotFoundError('FacetValue', input.id);
    }
    const updatedFacetValue = patchEntity(facetValue, input);
    await this.connection.getRepository(ctx, FacetValue).save(updatedFacetValue);
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
