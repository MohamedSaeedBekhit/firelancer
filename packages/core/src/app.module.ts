import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { Middleware, MiddlewareHandler } from './common/shared-types';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { ConnectionModule } from './connection/connection.module';
import { PluginModule } from './plugin/plugin.module';
import { ProcessContextModule } from './process-context/process-context.module';
import { ServiceModule } from './service/service.module';
import { I18nModule, I18nService } from './i18n';

/* eslint-disable @typescript-eslint/no-require-imports */
const cookieSession = require('cookie-session');

@Module({
    imports: [
        ProcessContextModule,
        ConfigModule,
        ApiModule,
        PluginModule.forRoot(),
        ServiceModule,
        ConnectionModule,
        I18nModule,
    ],
})
export class AppModule implements NestModule {
    constructor(
        private configService: ConfigService,
        private i18nService: I18nService,
    ) {}

    configure(consumer: MiddlewareConsumer) {
        const { middlewares, adminApiPath, shopApiPath } = this.configService.apiOptions;
        const { cookieOptions } = this.configService.authOptions;

        const i18nextHandler = this.i18nService.handle();
        const defaultMiddleware: Middleware[] = [
            { handler: i18nextHandler, route: adminApiPath },
            { handler: i18nextHandler, route: shopApiPath },
        ];
        const allMiddlewares = defaultMiddleware.concat(middlewares);

        if (typeof cookieOptions?.name === 'object') {
            const shopApiCookieName = cookieOptions.name.shop;
            const adminApiCookieName = cookieOptions.name.admin;
            allMiddlewares.push({
                handler: cookieSession({ ...cookieOptions, name: adminApiCookieName }),
                route: adminApiPath,
            });
            allMiddlewares.push({
                handler: cookieSession({ ...cookieOptions, name: shopApiCookieName }),
                route: shopApiPath,
            });
        }

        const middlewareByRoute = this.groupMiddlewareByRoute(allMiddlewares);

        for (const [route, handlers] of Object.entries(middlewareByRoute)) {
            consumer.apply(...handlers).forRoutes(route);
        }
    }

    private groupMiddlewareByRoute(middlewareArray: Middleware[]): { [route: string]: MiddlewareHandler[] } {
        const result = {} as { [route: string]: MiddlewareHandler[] };
        for (const middleware of middlewareArray) {
            const route = middleware.route;
            if (!result[route]) {
                result[route] = [];
            }
            result[route].push(middleware.handler);
        }
        return result;
    }
}
