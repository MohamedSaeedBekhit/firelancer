import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE, RouterModule } from '@nestjs/core';
import { getConfig } from '../config/config-helpers';
import { ConfigModule } from '../config/config.module';
import { ConnectionModule } from '../connection/connection.module';
import { createDynamicRestModulesForPlugins } from '../plugin/dynamic-plugin-api.module';
import { ServiceModule } from '../service/service.module';
import { AdministratorController } from './controllers/admin/administrator.controller';
import { AdminAuthController } from './controllers/admin/auth.controller';
import { ShopAuthController } from './controllers/shop/auth.controller';
import { ShopJobPostController } from './controllers/shop/job-post.controller';
import { AuthGuard } from './middlewares/auth.guard';
import { ExceptionHandlerFilter } from './middlewares/exception-handler.filter';
import { I18nModule } from '../i18n/i18n.module';

const { apiOptions } = getConfig();

@Module({
    imports: [
        ConfigModule,
        ServiceModule,
        RouterModule.register([{ path: apiOptions.adminApiPath, module: AdminModule }]),
        ConnectionModule.forRoot(),
        I18nModule,
    ],
    controllers: [AdminAuthController, AdministratorController],
})
export class AdminModule {}

@Module({
    imports: [
        ConfigModule,
        ServiceModule,
        RouterModule.register([{ path: apiOptions.shopApiPath, module: ShopModule }]),
        ConnectionModule.forRoot(),
        I18nModule,
    ],
    controllers: [ShopAuthController, ShopJobPostController],
})
export class ShopModule {}

@Module({
    imports: [
        ConfigModule,
        ServiceModule,
        AdminModule,
        ShopModule,
        ConnectionModule.forRoot(),
        I18nModule,
        ...createDynamicRestModulesForPlugins('admin'),
        ...createDynamicRestModulesForPlugins('shop'),
    ],
    providers: [
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                transform: true,
                transformOptions: { enableImplicitConversion: true },
            }),
        },
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_FILTER,
            useClass: ExceptionHandlerFilter,
        },
    ],
})
export class ApiModule {}
