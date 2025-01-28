import { PaginatedList } from '@firelancer/common/lib/shared-types';
import { normalizeString, notNullOrUndefined } from '@firelancer/common/lib/shared-utils';
import { Injectable } from '@nestjs/common';
import { RequestContext, Translated } from '../../../common';
import { ConfigurableOperation, ID } from '../../../common/shared-schema';
import { ConfigService, Logger } from '../../../config';
import { TransactionalConnection } from '../../../connection';
import { User } from '../../../entity';
import { Collection } from '../../../entity/collection/collection.entity';
import { FacetValue } from '../../../entity/facet-value/facet-value.entity';
import { Facet } from '../../../entity/facet/facet.entity';
import {
    CollectionService,
    FacetService,
    FacetValueService,
    RequestContextService,
    RoleService,
} from '../../../service';
import { SearchService } from '../../../service/services/search.service';
import {
    CollectionDefinition,
    CollectionFilterDefinition,
    FacetDefinition,
    InitialData,
    RoleDefinition,
} from '../../types';
import { AssetImporter } from '../asset-importer/asset-importer';

/**
 * @description
 * Responsible for populating the database with InitialData.
 */
@Injectable()
export class Populator {
    // These Maps are used to cache newly-created entities and prevent duplicates
    // from being created.
    private facetMap = new Map<string, Facet>();
    private facetValueMap = new Map<string, FacetValue>();

    constructor(
        private collectionService: CollectionService,
        private roleService: RoleService,
        private configService: ConfigService,
        private connection: TransactionalConnection,
        private requestContextService: RequestContextService,
        private facetService: FacetService,
        private facetValueService: FacetValueService,
        private searchService: SearchService,
        private assetImporter: AssetImporter,
    ) {}

    async populateInitialData(data: InitialData) {
        const ctx = await this.createRequestContext();
        try {
            await this.populateRoles(ctx, data.roles);
        } catch (e) {
            if (e && e instanceof Error) {
                Logger.error('Could not populate roles');
                Logger.error(e.message, 'populator', e.stack);
            }
        }

        try {
            await this.populateFactes(ctx, data.facets);
        } catch (e) {
            if (e && e instanceof Error) {
                Logger.error('Could not populate facets');
                Logger.error(e.message, 'populator', e.stack);
            }
        }

        try {
            await this.populateCollections(ctx, data.collections);
        } catch (e) {
            if (e && e instanceof Error) {
                Logger.error('Could not populate collections');
                Logger.error(e.message, 'populator', e.stack);
            }
        }
    }

    private async populateFactes(ctx: RequestContext, facets: FacetDefinition[]): Promise<ID[]> {
        const facetValueIds: ID[] = [];
        for (const facetDef of facets) {
            const [facetName, valueName] = facetDef.split(':');

            let facetEntity: Facet;
            const cachedFacet = this.facetMap.get(facetName);
            if (cachedFacet) {
                facetEntity = cachedFacet;
            } else {
                const existing = await this.facetService.findByCode(ctx, normalizeString(facetName, '-'));
                if (existing) {
                    facetEntity = existing;
                } else {
                    facetEntity = await this.facetService.create(ctx, {
                        code: normalizeString(facetName, '-'),
                        translations: [
                            {
                                languageCode: ctx.languageCode,
                                name: facetName,
                            },
                        ],
                    });
                }
                this.facetMap.set(facetName, facetEntity);
            }

            let facetValueEntity: FacetValue;
            const facetValueMapKey = `${facetName}:${valueName}`;
            const cachedFacetValue = this.facetValueMap.get(facetValueMapKey);
            if (cachedFacetValue) {
                facetValueEntity = cachedFacetValue;
            } else {
                const existing = facetEntity.values.find((v) => v.name === valueName);
                if (existing) {
                    facetValueEntity = existing;
                } else {
                    facetValueEntity = await this.facetValueService.create(ctx, {
                        facetId: facetEntity.id,
                        code: normalizeString(valueName, '-'),
                        translations: [
                            {
                                languageCode: ctx.languageCode,
                                name: valueName,
                            },
                        ],
                    });
                }
                this.facetValueMap.set(facetValueMapKey, facetValueEntity);
            }
            facetValueIds.push(facetValueEntity.id);
        }

        return facetValueIds;
    }

    private async populateCollections(ctx: RequestContext, collections?: CollectionDefinition[]) {
        if (!collections) {
            return;
        }
        const allFacetValues = await this.facetValueService.findAll(ctx);
        const collectionMap = new Map<string, Collection>();
        for (const collectionDef of collections) {
            const parent = collectionDef.parentName && collectionMap.get(collectionDef.parentName);
            const parentId = parent ? parent.id : undefined;
            const { assets } = await this.assetImporter.getAssets(collectionDef.assetPaths || [], ctx);

            let filters: ConfigurableOperation[] = [];
            try {
                filters = (collectionDef.filters || []).map((filter) =>
                    this.processFilterDefinition(filter, allFacetValues),
                );
            } catch (e) {
                if (e && e instanceof Error) {
                    Logger.error(e.message);
                }
            }

            const collection = await this.collectionService.create(ctx, {
                translations: [
                    {
                        languageCode: ctx.languageCode,
                        name: collectionDef.name,
                        description: collectionDef.description || '',
                        slug: collectionDef.slug ?? collectionDef.name,
                    },
                ],
                isPrivate: collectionDef.private || false,
                parentId,
                assetIds: assets.map((a) => a.id.toString()),
                featuredAssetId: assets.length ? assets[0].id.toString() : undefined,
                filters,
                inheritFilters: collectionDef.inheritFilters ?? true,
            });
            collectionMap.set(collectionDef.name, collection);
        }
        // Wait for the created collection operations to complete before running the reindex of the search index.
        await new Promise((resolve) => setTimeout(resolve, 50));
        await this.searchService.reindex(ctx);
    }

    private async populateRoles(ctx: RequestContext, roles?: RoleDefinition[]) {
        if (!roles) {
            return;
        }
        for (const roleDef of roles) {
            await this.roleService.create(ctx, roleDef);
        }
    }

    private processFilterDefinition(
        filter: CollectionFilterDefinition,
        allFacetValues: PaginatedList<Translated<FacetValue>>,
    ): ConfigurableOperation {
        switch (filter.code) {
            case 'job-post-facet-value-filter': {
                const facetValueIds = filter.args.facetValueNames
                    .map((name) =>
                        allFacetValues.items.find((fv) => {
                            if (name.includes(':')) {
                                const [facetName, valueName] = name.split(':');
                                return (
                                    (fv.name === valueName || fv.code === valueName) &&
                                    (fv.facet.name === facetName || fv.facet.code === facetName)
                                );
                            } else {
                                return fv.name === name || fv.code === name;
                            }
                        }),
                    )
                    .filter(notNullOrUndefined)
                    .map((fv) => fv.id);
                return {
                    code: filter.code,
                    args: [
                        {
                            name: 'facetValueIds',
                            value: JSON.stringify(facetValueIds),
                        },
                        {
                            name: 'containsAny',
                            value: filter.args.containsAny.toString(),
                        },
                    ],
                };
            }
            default:
                throw new Error(`Filter with code "${filter.code as string}" is not recognized.`);
        }
    }

    private async createRequestContext() {
        const { superadminCredentials } = this.configService.authOptions;
        const superAdminUser = await this.connection.rawConnection.getRepository(User).findOne({
            where: { identifier: superadminCredentials.identifier },
        });
        const ctx = this.requestContextService.create({
            user: superAdminUser ?? undefined,
            apiType: 'admin',
        });
        return ctx;
    }
}
