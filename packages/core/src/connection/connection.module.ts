import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { TransactionSubscriber } from './transaction-subscriber';
import { TransactionWrapper } from './transaction-wrapper';
import { TransactionalConnection } from './transactional-connection';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.dbConnectionOptions,
      }),
    }),
  ],
  providers: [TransactionalConnection, TransactionWrapper, TransactionSubscriber],
  exports: [TransactionalConnection, TransactionWrapper, TransactionSubscriber],
})
export class ConnectionModule {
  static forPlugin(): DynamicModule {
    return {
      module: ConnectionModule,
      imports: [TypeOrmModule.forFeature()],
    };
  }
}
