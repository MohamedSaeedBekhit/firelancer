import 'dotenv/config';
import * as path from 'path';
import { AdminUiPlugin } from '@firelancer/admin-ui-plugin';
import { AssetServerPlugin } from '@firelancer/asset-server-plugin';
import { Base64IdStrategy, DefaultJobQueuePlugin, FirelancerConfig, Logger } from '@firelancer/core';
import { NextFunction, Request, Response } from 'express';
import { HelloWorldPlugin } from './plugins/hello-world/plugin';

const serverPort = Number(process.env.PORT) || 3000;
const serverHost = process.env.HOST || 'localhost';

export const config: FirelancerConfig = {
    apiOptions: {
        hostname: serverHost,
        port: serverPort,
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
        migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
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
            assetUploadDir: path.join(__dirname, '../static/assets'),
            assetUrlPrefix: process.env.IS_DEV ? undefined : 'https://www.my-shop.com/assets/',
        }),
        DefaultJobQueuePlugin.init({
            useDatabaseForBuffer: true,
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: serverPort + 2,
            adminUiConfig: {
                apiHost: `http://${serverHost}`,
                apiPort: serverPort,
            },
        }),
        HelloWorldPlugin,
    ],
    entityOptions: {
        entityIdStrategy: new Base64IdStrategy(),
    },
    importExportOptions: {
        importAssetsDir: path.join(__dirname, './import/assets'),
    },
};
