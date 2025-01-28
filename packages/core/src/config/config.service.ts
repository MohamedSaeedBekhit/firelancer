import { DynamicModule, Injectable, Type } from '@nestjs/common';
import { DataSourceOptions } from 'typeorm';
import { CurrencyCode, LanguageCode } from '../common/shared-schema';
import { getConfig } from './config-helpers';
import {
    ApiOptions,
    AssetOptions,
    AuthOptions,
    CatalogOptions,
    EntityOptions,
    FirelancerConfig,
    ImportExportOptions,
    JobQueueOptions,
    RuntimeFirelancerConfig,
    SystemOptions,
} from './firelancer-config';
import { Logger } from './strategies/logger/firelancer-logger';

@Injectable()
export class ConfigService implements FirelancerConfig {
    private activeConfig: RuntimeFirelancerConfig;

    constructor() {
        this.activeConfig = getConfig();
        if (this.activeConfig.authOptions.disableAuth) {
            Logger.warn('Auth has been disabled. This should never be the case for a production system!');
        }
    }

    get apiOptions(): Required<ApiOptions> {
        return this.activeConfig.apiOptions;
    }

    get authOptions(): Required<AuthOptions> {
        return this.activeConfig.authOptions;
    }

    get dbConnectionOptions(): DataSourceOptions {
        return this.activeConfig.dbConnectionOptions;
    }

    get defaultLanguageCode(): LanguageCode {
        return this.activeConfig.defaultLanguageCode;
    }

    get availableCurrencyCodes(): CurrencyCode[] {
        return this.activeConfig.availableCurrencyCodes;
    }

    get plugins(): Array<DynamicModule | Type<unknown>> {
        return this.activeConfig.plugins;
    }

    get jobQueueOptions(): Required<JobQueueOptions> {
        return this.activeConfig.jobQueueOptions;
    }

    get assetOptions(): Required<AssetOptions> {
        return this.activeConfig.assetOptions;
    }

    get catalogOptions(): Required<CatalogOptions> {
        return this.activeConfig.catalogOptions;
    }

    get systemOptions(): Required<SystemOptions> {
        return this.activeConfig.systemOptions;
    }

    get entityOptions(): Required<EntityOptions> {
        return this.activeConfig.entityOptions;
    }

    get importExportOptions(): Required<ImportExportOptions> {
        return this.activeConfig.importExportOptions;
    }
}
