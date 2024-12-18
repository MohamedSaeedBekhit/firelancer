import { bootstrap } from '@firelancer/core';
import { config } from './firelancer-config';

bootstrap(config).catch((err) => {
  console.log(err);
});
