import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { ConnectionModule } from '../connection/connection.module';
import { PluginModule } from '../plugin/plugin.module';
import { ServiceModule } from '../service/service.module';
import { Populator } from './providers/populator/populator';

@Module({
  // Important! PluginModule must be defined before ServiceModule
  // in order that overrides of Services are correctly registered with the injector.
  imports: [PluginModule.forRoot(), ServiceModule, ConnectionModule.forPlugin(), ConfigModule],
  exports: [Populator],
  providers: [Populator],
})
export class DataImportModule {}
