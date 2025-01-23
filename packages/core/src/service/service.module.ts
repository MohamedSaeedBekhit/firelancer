import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { ConfigModule } from '../config/config.module';
import { ConnectionModule } from '../connection/connection.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { JobQueueModule } from '../job-queue/job-queue.module';
import { ConfigArgService } from './helpers/config-arg/config-arg.service';
import { PasswordCipher } from './helpers/password-cipher/password-cipher';
import { RequestContextService } from './helpers/request-context/request-context.service';
import { VerificationTokenGenerator } from './helpers/verification-token-generator/verification-token-generator';
import { InitializerService } from './initializer.service';
import { AdministratorService } from './services/administrator.service';
import { AssetService } from './services/asset.service';
import { AuthService } from './services/auth.service';
import { BalanceService } from './services/balance.service';
import { CollectionService } from './services/collection.service';
import { CustomerService } from './services/customer.service';
import { FacetValueService } from './services/facet-value.service';
import { FacetService } from './services/facet.service';
import { HistoryService } from './services/history.service';
import { JobPostService } from './services/job-post.service';
import { RoleService } from './services/role.service';
import { SearchService } from './services/search.service';
import { SessionService } from './services/session.service';
import { UserService } from './services/user.service';
import { ListQueryBuilder } from './helpers/list-query-builder/list-query-builder';
import { TranslatableSaver } from './helpers/translatable-saver/translatable-saver';
import { TranslationDiffer } from './helpers/translatable-saver/translation-differ';
import { TranslatorService } from './helpers/translator/translator.service';
import { SlugValidator } from './helpers/slug-validator/slug-validator';

const services = [
    HistoryService,
    AdministratorService,
    AssetService,
    AuthService,
    BalanceService,
    CustomerService,
    FacetService,
    FacetValueService,
    JobPostService,
    RoleService,
    SessionService,
    UserService,
    CollectionService,
    SearchService,
];

const helpers = [
    ConfigArgService,
    ListQueryBuilder,
    PasswordCipher,
    RequestContextService,
    SlugValidator,
    TranslatableSaver,
    TranslationDiffer,
    TranslatorService,
    VerificationTokenGenerator,
];

/**
 * The ServiceCoreModule is imported internally by the ServiceModule. It is arranged in this way so that
 * there is only a single instance of this module being instantiated, and thus the lifecycle hooks will
 * only run a single time.
 */
@Module({
    imports: [ConnectionModule, ConfigModule, EventBusModule, CacheModule, JobQueueModule],
    providers: [...services, ...helpers, InitializerService],
    exports: [...services, ...helpers],
})
export class ServiceCoreModule {}

/**
 * The ServiceModule is responsible for the service layer, i.e. accessing the database
 * and implementing the main business logic of the application.
 *
 * The exported providers are used in the ApiModule, which is responsible for parsing requests
 * into a format suitable for the service layer logic.
 */
@Module({
    imports: [ServiceCoreModule],
    exports: [ServiceCoreModule],
})
export class ServiceModule {}
