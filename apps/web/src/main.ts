import { bootstrap, JobQueueService } from '@firelancer/core';
import { populate } from '@firelancer/core/cli';
import { initialData } from './data-sources/initial-data';
import { config } from './firelancer-config';

async function main() {
  bootstrap(config);
  // const bootstrapFn = async () => {
  //   const app = await bootstrap(config);
  //   await app.get(JobQueueService).start();
  //   return app;
  // };

  // try {
  //   const app = await populate(bootstrapFn, initialData);
  //   await app.close();
  //   process.exit(0);
  // } catch (error) {
  //   console.log(error);
  //   process.exit(1);
  // }
}

main();
