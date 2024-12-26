import { generateMigration } from '@firelancer/core';
import { config } from './firelancer-config';
import { join } from 'path';

generateMigration(config, { name: 'initial', outputDir: join(__dirname, './migrations') })
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.log(err);
    });
