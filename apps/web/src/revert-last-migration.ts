import { revertLastMigration } from '@firelancer/core';
import { config } from './firelancer-config';

revertLastMigration(config)
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.log(err);
    });
