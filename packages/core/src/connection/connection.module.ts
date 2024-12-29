import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { TypeOrmLogger } from '../config';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { TransactionSubscriber } from './transaction-subscriber';
import { TransactionWrapper } from './transaction-wrapper';
import { TransactionalConnection } from './transactional-connection';

let defaultTypeOrmModule: DynamicModule;

@Module({
    providers: [TransactionalConnection, TransactionWrapper, TransactionSubscriber],
    exports: [TransactionalConnection, TransactionWrapper, TransactionSubscriber],
})
export class ConnectionModule {
    static forRoot(): DynamicModule {
        if (!defaultTypeOrmModule) {
            defaultTypeOrmModule = TypeOrmModule.forRootAsync({
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => {
                    const { dbConnectionOptions } = configService;
                    const logger = ConnectionModule.getTypeOrmLogger(dbConnectionOptions);
                    return {
                        ...dbConnectionOptions,
                        logger,
                    };
                },
                inject: [ConfigService],
            });
        }
        return {
            module: ConnectionModule,
            imports: [defaultTypeOrmModule],
        };
    }

    static forPlugin(): DynamicModule {
        return {
            module: ConnectionModule,
            imports: [TypeOrmModule.forFeature()],
        };
    }

    static getTypeOrmLogger(dbConnectionOptions: DataSourceOptions) {
        if (!dbConnectionOptions.logger) {
            return new TypeOrmLogger(dbConnectionOptions.logging);
        } else {
            return dbConnectionOptions.logger;
        }
    }
}
