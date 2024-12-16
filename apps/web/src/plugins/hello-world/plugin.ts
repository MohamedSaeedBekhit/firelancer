import { AttemptedLoginEvent, EventBus, FirelancerPlugin, Logger, PluginCommonModule } from '@firelancer/core';
import { OnApplicationBootstrap } from '@nestjs/common';
import { HelloWorldController } from './api/hello-world.controller.js';
import { loggerCtx } from './constants.js';

@FirelancerPlugin({
  imports: [PluginCommonModule],
  shopApiExtensions: {
    controllers: [HelloWorldController],
  },
  compatibility: '^0.0.0',
})
export class HelloWorldPlugin implements OnApplicationBootstrap {
  constructor(private eventBus: EventBus) {}

  onApplicationBootstrap() {
    this.eventBus.ofType(AttemptedLoginEvent).subscribe((event) => {
      Logger.info('user attemped to login', loggerCtx);
    });
  }
}
