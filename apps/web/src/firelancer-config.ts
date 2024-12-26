import 'dotenv/config';
import { AssetServerPlugin } from '@firelancer/asset-server-plugin';
import { DefaultJobQueuePlugin, FirelancerConfig, Logger } from '@firelancer/core';
import { NextFunction, Request, Response } from 'express';
import { join } from 'path';
import { HelloWorldPlugin } from './plugins/hello-world/plugin';

export const config: FirelancerConfig = {
    apiOptions: {
        hostname: '0.0.0.0',
        port: 3001,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        middlewares: [
            {
                route: 'admin-api',
                handler: (_req: Request, _res: Response, next: NextFunction) => {
                    Logger.info(`admin-api middleware`);
                    next();
                },
            },
            {
                route: 'shop-api',
                handler: (_req: Request, _res: Response, next: NextFunction) => {
                    Logger.info(`shop-api middleware`);
                    next();
                },
            },
        ],
    },
    dbConnectionOptions: {
        type: 'postgres',
        port: Number(process.env.POSTGRES_CONNECTION_PORT!),
        host: process.env.POSTGRES_CONNECTION_HOST!,
        username: process.env.POSTGRES_CONNECTION_USERNAME!,
        password: process.env.POSTGRES_CONNECTION_PASSWORD!,
        database: process.env.POSTGRES_DATABASE!,
        synchronize: false,
        migrations: [join(__dirname, './migrations/*.+(js|ts)')],
    },
    authOptions: {
        tokenMethod: ['cookie', 'bearer'],
        cookieOptions: {
            name: {
                admin: 'admin-session',
                shop: 'shop-session',
            },
        },
    },
    plugins: [
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: join(__dirname, '../static/assets'),
            assetUrlPrefix: process.env.IS_DEV ? undefined : 'https://www.my-shop.com/assets/',
        }),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        HelloWorldPlugin,
    ],
};
