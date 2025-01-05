import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { DataSource, DataSourceOptions } from 'typeorm';
import { MysqlDriver } from 'typeorm/driver/mysql/MysqlDriver';
import { camelCase } from 'typeorm/util/StringUtils';
import { preBootstrapConfig } from './bootstrap';
import { resetConfig } from './config/config-helpers';
import { FirelancerConfig } from './config/firelancer-config';

/**
 * @description
 * Configuration for generating a new migration script via generateMigration.
 */
export interface MigrationOptions {
    /**
     * @description
     * The name of the migration. The resulting migration script will be named
     * `{TIMESTAMP}-{name}.ts`.
     */
    name: string;
    /**
     * @description
     * The output directory of the generated migration scripts.
     */
    outputDir?: string;
}

/**
 * @description
 * Runs any pending database migrations.
 */
export async function runMigrations(userConfig: Partial<FirelancerConfig>): Promise<string[]> {
    const config = await preBootstrapConfig(userConfig);
    const connection = new DataSource(createConnectionOptions(config));
    await connection.initialize();

    const migrationsRan: string[] = [];
    try {
        const migrations = await disableForeignKeysForSqLite(connection, () => connection.runMigrations({ transaction: 'each' }));
        for (const migration of migrations) {
            log(pc.green(`Successfully ran migration: ${migration.name}`));
            migrationsRan.push(migration.name);
        }
    } catch (e: unknown) {
        log(pc.red('An error occurred when running migrations:'));
        log(e instanceof Error ? e.message : 'Unknown error');
        if (isRunningFromFirelancerCli()) {
            throw e;
        } else {
            process.exitCode = 1;
        }
    } finally {
        await checkMigrationStatus(connection);
        await connection.destroy();
        resetConfig();
    }
    return migrationsRan;
}

async function checkMigrationStatus(connection: DataSource) {
    const builderLog = await connection.driver.createSchemaBuilder().log();
    if (builderLog.upQueries.length) {
        log(
            pc.yellow(
                'Your database schema does not match your current configuration. Generate a new migration for the following changes:',
            ),
        );
        for (const query of builderLog.upQueries) {
            log(' - ' + pc.yellow(query.query));
        }
    }
}

/**
 * @description
 * Reverts the last applied database migration. See [TypeORM migration docs](https://typeorm.io/#/migrations)
 * for more information about the underlying migration mechanism.
 */
export async function revertLastMigration(userConfig: Partial<FirelancerConfig>) {
    const config = await preBootstrapConfig(userConfig);
    const connection = new DataSource(createConnectionOptions(config));
    await connection.initialize();
    try {
        await disableForeignKeysForSqLite(connection, () => connection.undoLastMigration({ transaction: 'each' }));
    } catch (e) {
        log(pc.red('An error occurred when reverting migration:'));
        log(e instanceof Error ? e.message : 'Unknown error');
        if (isRunningFromFirelancerCli()) {
            throw e;
        } else {
            process.exitCode = 1;
        }
    } finally {
        await connection.destroy();
        resetConfig();
    }
}

/**
 * @description
 * Generates a new migration file based on any schema changes (e.g. adding or removing CustomFields).
 * See [TypeORM migration docs](https://typeorm.io/#/migrations) for more information about the
 * underlying migration mechanism.
 */
export async function generateMigration(userConfig: Partial<FirelancerConfig>, options: MigrationOptions): Promise<string | undefined> {
    const config = await preBootstrapConfig(userConfig);
    const connection = new DataSource(createConnectionOptions(config));
    await connection.initialize();

    // TODO: This can hopefully be simplified if/when TypeORM exposes this CLI command directly.
    // See https://github.com/typeorm/typeorm/issues/4494
    const sqlInMemory = await connection.driver.createSchemaBuilder().log();
    const upSqls: string[] = [];
    const downSqls: string[] = [];
    let migrationName: string | undefined;

    // mysql is exceptional here because it uses ` character in to escape names in queries, that's why for mysql
    // we are using simple quoted string instead of template string syntax
    if (connection.driver instanceof MysqlDriver) {
        sqlInMemory.upQueries.forEach((upQuery) => {
            upSqls.push(
                '        await queryRunner.query("' +
                    upQuery.query.replace(new RegExp('"', 'g'), '\\"') +
                    '", ' +
                    JSON.stringify(upQuery.parameters) +
                    ');',
            );
        });
        sqlInMemory.downQueries.forEach((downQuery) => {
            downSqls.push(
                '        await queryRunner.query("' +
                    downQuery.query.replace(new RegExp('"', 'g'), '\\"') +
                    '", ' +
                    JSON.stringify(downQuery.parameters) +
                    ');',
            );
        });
    } else {
        sqlInMemory.upQueries.forEach((upQuery) => {
            upSqls.push(
                '        await queryRunner.query(`' +
                    upQuery.query.replace(new RegExp('`', 'g'), '\\`') +
                    '`, ' +
                    JSON.stringify(upQuery.parameters) +
                    ');',
            );
        });
        sqlInMemory.downQueries.forEach((downQuery) => {
            downSqls.push(
                '        await queryRunner.query(`' +
                    downQuery.query.replace(new RegExp('`', 'g'), '\\`') +
                    '`, ' +
                    JSON.stringify(downQuery.parameters) +
                    ');',
            );
        });
    }

    if (upSqls.length) {
        if (options.name) {
            const timestamp = new Date().getTime();
            const filename = timestamp.toString() + '-' + options.name + '.ts';
            const directory = options.outputDir;
            const fileContent = getTemplate(options.name, timestamp, upSqls, downSqls.reverse());
            const outputPath = directory ? path.join(directory, filename) : path.join(process.cwd(), filename);
            await fs.ensureFile(outputPath);
            fs.writeFileSync(outputPath, fileContent);

            log(pc.green(`Migration ${pc.blue(outputPath)} has been generated successfully.`));
            migrationName = outputPath;
        }
    } else {
        log(pc.yellow('No changes in database schema were found - cannot generate a migration.'));
    }
    await connection.destroy();
    resetConfig();
    return migrationName;
}

function createConnectionOptions(userConfig: Partial<FirelancerConfig>): DataSourceOptions {
    return Object.assign({ logging: ['query', 'error', 'schema'] }, userConfig.dbConnectionOptions, {
        subscribers: [],
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        logger: 'advanced-console',
    });
}

/**
 * There is a bug in TypeORM which causes db schema changes to fail with SQLite. This
 * is a work-around for the issue.
 */
async function disableForeignKeysForSqLite<T>(connection: DataSource, work: () => Promise<T>): Promise<T> {
    const isSqLite = connection.options.type === 'sqlite' || connection.options.type === 'better-sqlite3';
    if (isSqLite) {
        await connection.query('PRAGMA foreign_keys=OFF');
    }
    const result = await work();
    if (isSqLite) {
        await connection.query('PRAGMA foreign_keys=ON');
    }
    return result;
}

/**
 * Gets contents of the migration file.
 */
function getTemplate(name: string, timestamp: number, upSqls: string[], downSqls: string[]): string {
    return `import {MigrationInterface, QueryRunner} from "typeorm";

export class ${camelCase(name, true)}${timestamp} implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
${upSqls.join(`
`)}
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
${downSqls.join(`
`)}
   }

}
`;
}

function log(message: string) {
    // If running from within the Firelancer CLI, we allow the CLI app
    // to handle the logging.
    if (isRunningFromFirelancerCli()) {
        return;
    }
    console.log(message);
}

function isRunningFromFirelancerCli(): boolean {
    return process.env.FIRELANCER_RUNNING_IN_CLI != null;
}
