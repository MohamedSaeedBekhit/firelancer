import { INestApplicationContext } from '@nestjs/common';

const loggerCtx = 'Populate';

/**
 * @description
 * Populates the Firelancer server with some initial data
 */
export async function populate<T extends INestApplicationContext>(
    bootstrapFn: () => Promise<T | undefined>,
    initialDataPathOrObject: string | object,
): Promise<T> {
    const app = await bootstrapFn();
    if (!app) {
        throw new Error('Could not bootstrap the firelancer app');
    }
    const { Logger } = await import('@firelancer/core');

    const initialData: import('@firelancer/core').InitialData =
        typeof initialDataPathOrObject === 'string' ? require(initialDataPathOrObject) : initialDataPathOrObject;

    await populateInitialData(app, initialData);
    Logger.info('Done!', loggerCtx);
    return app;
}

export async function populateInitialData(app: INestApplicationContext, initialData: import('@firelancer/core').InitialData) {
    const { Populator, Logger } = await import('@firelancer/core');
    const populator = app.get(Populator);
    try {
        await populator.populateInitialData(initialData);
        Logger.info('Populated initial data', loggerCtx);
    } catch (err: any) {
        Logger.error(err.message, loggerCtx);
    }
}
