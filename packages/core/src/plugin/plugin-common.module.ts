import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { ConfigModule } from '../config/config.module';
import { ConnectionModule } from '../connection/connection.module';
import { DataImportModule } from '../data-import/data-import.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { JobQueueModule } from '../job-queue/job-queue.module';
import { ServiceModule } from '../service/service.module';
import { ProcessContextModule } from '../process-context/process-context.module';
import { I18nModule } from '../i18n/i18n.module';

/**
 * @description
 * This module provides the common services, configuration, and event bus capabilities
 * required by a typical plugin. It should be imported into plugins to avoid having to
 * repeat the same boilerplate for each individual plugin.
 *
 * The PluginCommonModule exports:
 *
 * * `EventBusModule`, allowing the injection of the EventBus service.
 * * `ServiceModule` allowing the injection of any of the various entity services such as CustomerService, OrderService etc.
 * * `ConfigModule`, allowing the injection of the ConfigService.
 */
@Module({
    imports: [
        EventBusModule,
        ConfigModule,
        ConnectionModule.forPlugin(),
        ServiceModule,
        JobQueueModule,
        CacheModule,
        ProcessContextModule,
        DataImportModule,
        I18nModule,
    ],
    exports: [
        EventBusModule,
        ConfigModule,
        ConnectionModule.forPlugin(),
        ServiceModule,
        JobQueueModule,
        CacheModule,
        ProcessContextModule,
        DataImportModule,
        I18nModule,
    ],
})
export class PluginCommonModule {}
