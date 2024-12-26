import { runMigrations } from '@firelancer/core';
import { config } from './firelancer-config';

runMigrations(config)
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.log(err);
    });
