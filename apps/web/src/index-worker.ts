import { bootstrapWorker } from '@firelancer/core';
import { config } from './firelancer-config';

bootstrapWorker(config)
    .then((worker) => worker.startJobQueue())
    .catch((err) => {
        console.log(err);
    });
