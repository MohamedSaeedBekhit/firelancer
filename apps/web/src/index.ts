import 'dotenv/config';
import { bootstrap, runMigrations } from '@firelancer/core';
import { config } from './firelancer-config';

runMigrations(config)
    .then(() => bootstrap(config))
    .catch((err) => {
        console.log(err);
    });
