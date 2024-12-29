import { INestApplication, INestApplicationContext, NestApplicationOptions, Type } from '@nestjs/common';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getConnectionToken } from '@nestjs/typeorm';
import { satisfies } from 'semver';
import { Connection, DataSourceOptions } from 'typeorm';
import { FirelancerWorker } from './worker';
import { DEFAULT_COOKIE_NAME } from './common/constants';
import { InternalServerError } from './common/error/errors';
import { getConfig, setConfig } from './config/config-helpers';
import { FirelancerConfig, RuntimeFirelancerConfig } from './config/firelancer-config';
import { DefaultLogger } from './config/strategies/logger/default/default-logger';
import { Logger } from './config/strategies/logger/firelancer-logger';
import { Administrator, setEntityIdStrategy } from './entity';
import { coreEntitiesMap } from './entity/core-entities';
import { getPluginStartupMessages } from './plugin';
import { getCompatibility, getConfigurationFunction, getEntitiesFromPlugins } from './plugin/plugin-metadata';
import { setProcessContext } from './process-context/process-context';
import { FIRELANCER_VERSION } from './version';

/* eslint-disable @typescript-eslint/no-require-imports */
const cookieSession = require('cookie-session');

/**
 * @description
 * Additional options that can be used to configure the bootstrap process of the
 * Firelancer server.
 */
export interface BootstrapOptions {
    /**
     * @description
     * These options get passed directly to the `NestFactory.create()` method.
     */
    nestApplicationOptions: NestApplicationOptions;
}
/**
 * @description
 * Additional options that can be used to configure the bootstrap process of the
 * Firelancer worker.
 */
export interface BootstrapWorkerOptions {
    /**
     * @description
     * These options get passed directly to the `NestFactory.createApplicationContext` method.
     */
    nestApplicationContextOptions: NestApplicationContextOptions;
}

/**
 * @description
 * Bootstraps the Firelancer server. This is the entry point to the application.
 *
 * @example
 * ```ts
 * import { bootstrap } from '\@firelancer/core';
 * import { config } from './firelancer-config';
 *
 * bootstrap(config).catch(err => {
 *   console.log(err);
 *   process.exit(1);
 * });
 * ```
 * */
export async function bootstrap(userConfig?: Partial<FirelancerConfig>, options?: BootstrapOptions) {
    const config = await preBootstrapConfig(userConfig);
    Logger.useLogger(config.logger);
    Logger.info(`Bootstrapping Firelancer Server (pid: ${process.pid})...`);
    checkPluginCompatibility(config);

    // The AppModule *must* be loaded only after the entities have been set in the
    // config, so that they are available when the AppModule decorator is evaluated.
    // eslint-disable-next-line
    const { AppModule } = await import('./app.module.js');
    setProcessContext('server');
    const { hostname, port, cors, middlewares } = config.apiOptions;

    DefaultLogger.hideNestBoostrapLogs();
    const app = await NestFactory.create(AppModule, {
        logger: new Logger(),
        cors,
        ...options?.nestApplicationOptions,
    });
    DefaultLogger.restoreOriginalLogLevel();
    app.useLogger(new Logger());

    const { tokenMethod } = config.authOptions;
    const usingCookie = tokenMethod === 'cookie' || (Array.isArray(tokenMethod) && tokenMethod.includes('cookie'));
    if (usingCookie) {
        configureSessionCookies(app, config);
    }

    // swagger config
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Firelancer')
        .setDescription('Firelancer API')
        .setVersion(FIRELANCER_VERSION)
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, documentFactory);

    await app.listen(port, hostname || '');
    app.enableShutdownHooks();
    logWelcomeMessage(config);
    return app;
}

/**
 * @description
 * Bootstraps a Firelancer worker. Resolves to a FirelancerWorker object containing a reference to the underlying
 * NestJs [standalone application](https://docs.nestjs.com/standalone-applications) as well as convenience
 * methods for starting the job queue and health check server.
 *
 * @example
 * ```ts
 * import { bootstrapWorker } from '\@firelancer/core';
 * import { config } from './Firelancer-config';
 *
 * bootstrapWorker(config)
 *   .then(worker => worker.startJobQueue())
 *   .catch(err => {
 *     console.log(err);
 *     process.exit(1);
 *   });
 * ```
 * */
export async function bootstrapWorker(userConfig: Partial<FirelancerConfig>, options?: BootstrapWorkerOptions): Promise<FirelancerWorker> {
    const FirelancerConfig = await preBootstrapConfig(userConfig);
    const config = disableSynchronize(FirelancerConfig);
    config.logger.setDefaultContext?.('Firelancer Worker');
    Logger.useLogger(config.logger);
    Logger.info(`Bootstrapping Firelancer Worker (pid: ${process.pid})...`);
    checkPluginCompatibility(config);

    setProcessContext('worker');
    DefaultLogger.hideNestBoostrapLogs();

    const WorkerModule = await import('./worker/worker.module.js').then((m) => m.WorkerModule);
    const workerApp = await NestFactory.createApplicationContext(WorkerModule, {
        logger: new Logger(),
        ...options?.nestApplicationContextOptions,
    });
    DefaultLogger.restoreOriginalLogLevel();
    workerApp.useLogger(new Logger());
    workerApp.enableShutdownHooks();
    await validateDbTablesForWorker(workerApp);
    Logger.info('Firelancer Worker is ready');
    return new FirelancerWorker(workerApp);
}

/**
 * Setting the global config must be done prior to loading the AppModule.
 */
export async function preBootstrapConfig(userConfig: Partial<FirelancerConfig> = {}): Promise<Readonly<RuntimeFirelancerConfig>> {
    if (userConfig) {
        await setConfig(userConfig);
    }

    const entities = getAllEntities(userConfig);
    await setConfig({ dbConnectionOptions: { entities } });

    let config = getConfig();
    // The logger is set here so that we are able to log any messages prior to the final
    // logger (which may depend on config coming from a plugin) being set.
    Logger.useLogger(config.logger);
    config = await runPluginConfigurations(config);
    setEntityIdStrategy(config.entityOptions.entityIdStrategy, entities);
    setExposedHeaders(config);
    return config;
}

/**
 * Fix race condition when modifying DB
 */
function disableSynchronize(userConfig: Readonly<RuntimeFirelancerConfig>): Readonly<RuntimeFirelancerConfig> {
    const config = {
        ...userConfig,
        dbConnectionOptions: {
            ...userConfig.dbConnectionOptions,
            synchronize: false,
        } as DataSourceOptions,
    };
    return config;
}

/**
 * Check that the Database tables exist. When running Firelancer server & worker
 * concurrently for the first time, the worker will attempt to access the
 * DB tables before the server has populated them (assuming synchronize = true in config).
 * This method will use polling to check the existence of a known table
 * before allowing the rest of the worker bootstrap to continue.
 * @param worker
 */
async function validateDbTablesForWorker(worker: INestApplicationContext) {
    const connection: Connection = worker.get(getConnectionToken());
    await new Promise<void>(async (resolve, reject) => {
        const checkForTables = async (): Promise<boolean> => {
            try {
                const adminCount = await connection.getRepository(Administrator).count();
                return 0 < adminCount;
            } catch (e: any) {
                return false;
            }
        };

        const pollIntervalMs = 5000;
        let attempts = 0;
        const maxAttempts = 10;
        let validTableStructure = false;
        Logger.verbose('Checking for expected DB table structure...');
        while (!validTableStructure && attempts < maxAttempts) {
            attempts++;
            validTableStructure = await checkForTables();
            if (validTableStructure) {
                Logger.verbose('Table structure verified');
                resolve();
                return;
            }
            Logger.verbose(
                `Table structure could not be verified, trying again after ${pollIntervalMs}ms (attempt ${attempts} of ${maxAttempts})`,
            );
            await new Promise((resolve1) => setTimeout(resolve1, pollIntervalMs));
        }
        reject('Could not validate DB table structure. Aborting bootstrap.');
    });
}

/**
 * If the 'bearer' tokenMethod is being used, then we automatically expose the authTokenHeaderKey header
 * in the CORS options, making sure to preserve any user-configured exposedHeaders.
 */
function setExposedHeaders(config: Readonly<RuntimeFirelancerConfig>) {
    const { tokenMethod } = config.authOptions;
    const isUsingBearerToken = tokenMethod === 'bearer' || (Array.isArray(tokenMethod) && tokenMethod.includes('bearer'));
    if (isUsingBearerToken) {
        const authTokenHeaderKey = config.authOptions.authTokenHeaderKey;
        const corsOptions = config.apiOptions.cors;
        if (typeof corsOptions !== 'boolean') {
            const { exposedHeaders } = corsOptions;
            let exposedHeadersWithAuthKey: string[];
            if (!exposedHeaders) {
                exposedHeadersWithAuthKey = [authTokenHeaderKey];
            } else if (typeof exposedHeaders === 'string') {
                exposedHeadersWithAuthKey = exposedHeaders
                    .split(',')
                    .map((x) => x.trim())
                    .concat(authTokenHeaderKey);
            } else {
                exposedHeadersWithAuthKey = exposedHeaders.concat(authTokenHeaderKey);
            }
            corsOptions.exposedHeaders = exposedHeadersWithAuthKey;
        }
    }
}

/**
 * Initialize any configured plugins.
 */
async function runPluginConfigurations(config: RuntimeFirelancerConfig): Promise<RuntimeFirelancerConfig> {
    for (const plugin of config.plugins) {
        const configFn = getConfigurationFunction(plugin);
        if (typeof configFn === 'function') {
            const result = await configFn(config);
            Object.assign(config, result);
        }
    }
    return config;
}

/**
 * Returns an array of core entities and any additional entities defined in plugins.
 */
function getAllEntities(userConfig: Partial<FirelancerConfig>): Array<Type<unknown>> {
    const coreEntities = Object.values(coreEntitiesMap) as Array<Type<unknown>>;
    const pluginEntities = getEntitiesFromPlugins(userConfig.plugins);
    const allEntities: Array<Type<unknown>> = coreEntities;
    // Check to ensure that no plugins are defining entities with names which conflict with existing entities.
    for (const pluginEntity of pluginEntities) {
        if (allEntities.find((e) => e.name === pluginEntity.name)) {
            throw new InternalServerError('error.entity-name-conflict');
        } else {
            allEntities.push(pluginEntity);
        }
    }
    return allEntities;
}

function configureSessionCookies(app: INestApplication, userConfig: Readonly<RuntimeFirelancerConfig>): void {
    const { cookieOptions } = userConfig.authOptions;

    // Globally set the cookie session middleware
    const cookieName = typeof cookieOptions?.name === 'string' ? cookieOptions.name : cookieOptions.name?.shop;
    app.use(
        cookieSession({
            ...cookieOptions,
            name: cookieName ?? DEFAULT_COOKIE_NAME,
        }),
    );
}

function checkPluginCompatibility(config: RuntimeFirelancerConfig): void {
    for (const plugin of config.plugins) {
        const compatibility = getCompatibility(plugin);
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const pluginName = (plugin as any).name as string;
        if (!compatibility) {
            Logger.info(
                `The plugin "${pluginName}" does not specify a compatibility range, so it is not guaranteed to be compatible with this version of Firelancer.`,
            );
        } else {
            if (!satisfies(FIRELANCER_VERSION, compatibility, { loose: true, includePrerelease: true })) {
                Logger.error(
                    `Plugin "${pluginName}" is not compatible with this version of Firelancer. ` +
                        `It specifies a semver range of "${compatibility}" but the current version is "${FIRELANCER_VERSION}".`,
                );
                throw new InternalServerError(`Plugin "${pluginName}" is not compatible with this version of Firelancer.`);
            }
        }
    }
}

function logWelcomeMessage(config: RuntimeFirelancerConfig) {
    const { port, shopApiPath, adminApiPath, hostname } = config.apiOptions;
    const apiCliGreetings: Array<readonly [string, string]> = [];
    const pathToUrl = (path: string) => `http://${hostname || 'localhost'}:${port}/${path}`;
    apiCliGreetings.push(['Shop API', pathToUrl(shopApiPath)]);
    apiCliGreetings.push(['Admin API', pathToUrl(adminApiPath)]);
    apiCliGreetings.push(...getPluginStartupMessages().map(({ label, path }) => [label, pathToUrl(path)] as const));
    const columnarGreetings = arrangeCliGreetingsInColumns(apiCliGreetings);
    const title = `Firelancer server (v${FIRELANCER_VERSION}) now running on port ${port}`;
    const maxLineLength = Math.max(title.length, ...columnarGreetings.map((l) => l.length));
    const titlePadLength = title.length < maxLineLength ? Math.floor((maxLineLength - title.length) / 2) : 0;
    Logger.info('='.repeat(maxLineLength));
    Logger.info(title.padStart(title.length + titlePadLength));
    Logger.info('-'.repeat(maxLineLength).padStart(titlePadLength));
    columnarGreetings.forEach((line) => Logger.info(line));
    Logger.info('='.repeat(maxLineLength));
}

function arrangeCliGreetingsInColumns(lines: Array<readonly [string, string]>): string[] {
    const columnWidth = Math.max(...lines.map((l) => l[0].length)) + 2;
    return lines.map((l) => `${(l[0] + ':').padEnd(columnWidth)}${l[1]}`);
}
