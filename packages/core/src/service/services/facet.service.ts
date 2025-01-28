import { PaginatedList } from '@firelancer/common/lib/shared-types';
import { assertFound, idsAreEqual } from '@firelancer/common/lib/shared-utils';
import { Injectable } from '@nestjs/common';
import { RelationPaths } from '../../api';
import { ListQueryOptions, RequestContext, Translated, UserInputError } from '../../common';
import { CreateFacetInput, ID, UpdateFacetInput } from '../../common/shared-schema';
import { TransactionalConnection } from '../../connection';
import { FacetTranslation } from '../../entity';
import { Facet } from '../../entity/facet/facet.entity';
import { EventBus } from '../../event-bus';
import { FacetEvent } from '../../event-bus/events/facet-event';
import { TranslatableSaver, TranslatorService } from '../../service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { FacetValueService } from './facet-value.service';

/**
 * @description
 * Contains methods relating to Facet entities.
 */
@Injectable()
export class FacetService {
    constructor(
        private connection: TransactionalConnection,
        private eventBus: EventBus,
        private facetValueService: FacetValueService,
        private listQueryBuilder: ListQueryBuilder,
        private translatableSaver: TranslatableSaver,
        private translator: TranslatorService,
    ) {}

    async findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<Facet>,
        relations?: RelationPaths<Facet>,
    ): Promise<PaginatedList<Translated<Facet>>> {
        return this.listQueryBuilder
            .build(Facet, options, {
                relations: relations ?? ['values', 'values.facet'],
                ctx,
            })
            .getManyAndCount()
            .then(([facets, totalItems]) => {
                const items = facets.map((facet) =>
                    this.translator.translate(facet, ctx, ['values', ['values', 'facet']]),
                );
                return {
                    items,
                    totalItems,
                };
            });
    }

    async findOne(
        ctx: RequestContext,
        facetId: ID,
        relations?: RelationPaths<Facet>,
    ): Promise<Translated<Facet> | undefined> {
        const facet = await this.connection
            .getRepository(ctx, Facet)
            .findOne({
                where: {
                    id: facetId,
                },
                relations: relations ?? ['values', 'values.facet'],
            })
            .then((result) => result ?? undefined);

        if (!facet) {
            return;
        }

        return this.translator.translate(facet, ctx, ['values', ['values', 'facet']]);
    }

    async findByCode(ctx: RequestContext, facetCode: string): Promise<Facet | undefined> {
        const facet = await this.connection.getRepository(ctx, Facet).findOne({
            where: { code: facetCode },
            relations: ['values', 'values.facet'],
        });

        if (!facet) {
            return;
        }

        return this.translator.translate(facet, ctx, ['values', ['values', 'facet']]);
    }

    /**
     * @description
     * Returns the Facet which contains the given FacetValue id.
     */
    async findByFacetValueId(ctx: RequestContext, facetValueId: ID): Promise<Translated<Facet> | undefined> {
        const facet = await this.connection
            .getRepository(ctx, Facet)
            .createQueryBuilder('facet')
            .leftJoinAndSelect('facet.translations', 'translations')
            .leftJoin('facet.values', 'facetValue')
            .where('facetValue.id = :facetValueId', { facetValueId })
            .getOne();
        if (facet) {
            return this.translator.translate(facet, ctx);
        }
    }

    async create(ctx: RequestContext, input: CreateFacetInput): Promise<Translated<Facet>> {
        const facet = await this.translatableSaver.create({
            ctx,
            input,
            entityType: Facet,
            translationType: FacetTranslation,
            beforeSave: async (f) => {
                f.code = await this.ensureUniqueCode(ctx, f.code);
            },
        });

        await this.eventBus.publish(new FacetEvent(ctx, facet, 'created', input));
        return assertFound(this.findOne(ctx, facet.id));
    }

    async update(ctx: RequestContext, input: UpdateFacetInput): Promise<Translated<Facet>> {
        const facet = await this.translatableSaver.update({
            ctx,
            input,
            entityType: Facet,
            translationType: FacetTranslation,
            beforeSave: async (f) => {
                if (f.code) {
                    f.code = await this.ensureUniqueCode(ctx, f.code, f.id);
                }
            },
        });
        await this.eventBus.publish(new FacetEvent(ctx, facet, 'updated', input));
        return assertFound(this.findOne(ctx, facet.id));
    }

    async delete(ctx: RequestContext, id: ID, force: boolean = false): Promise<void> {
        const facet = await this.connection.getEntityOrThrow(ctx, Facet, id, {
            relations: ['values'],
        });
        let jobPostsCount = 0;
        if (facet.values.length) {
            const counts = await this.facetValueService.checkFacetValueUsage(
                ctx,
                facet.values.map((fv) => fv.id),
            );
            jobPostsCount = counts.jobPostsCount;
        }

        const hasUsages = !!jobPostsCount;
        const deletedFacet = new Facet(facet);
        if (hasUsages && !force) {
            throw new UserInputError('message.facet-used');
        }
        await this.connection.getRepository(ctx, Facet).remove(facet);
        await this.eventBus.publish(new FacetEvent(ctx, deletedFacet, 'deleted', id));
    }

    /**
     * Checks to ensure the Facet code is unique. If there is a conflict, then the code is suffixed
     * with an incrementing integer.
     */
    private async ensureUniqueCode(ctx: RequestContext, code: string, id?: ID) {
        let candidate = code;
        let suffix = 1;
        let conflict = false;
        const alreadySuffixed = /-\d+$/;
        do {
            const match = await this.connection.getRepository(ctx, Facet).findOne({ where: { code: candidate } });

            conflict = !!match && ((id != null && !idsAreEqual(match.id, id)) || id == null);
            if (conflict) {
                suffix++;
                if (alreadySuffixed.test(candidate)) {
                    candidate = candidate.replace(alreadySuffixed, `-${suffix}`);
                } else {
                    candidate = `${candidate}-${suffix}`;
                }
            }
        } while (conflict);

        return candidate;
    }
}
