import 'dotenv/config';
import { bootstrap, JobQueueService } from '@firelancer/core';
import { populate } from '@firelancer/core/cli';
import { initialData } from './data-sources/initial-data';
import { config } from './firelancer-config';

const bootstrapFn = async () => {
    const _app = await bootstrap(config);
    await _app.get(JobQueueService).start();
    return _app;
};

populate(bootstrapFn, initialData)
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.log(err);
    });
