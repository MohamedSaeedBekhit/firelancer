import { cancel, intro, isCancel, log, outro, select } from '@clack/prompts';
import pc from 'picocolors';
import { generateMigrationCommand } from './generate-migration/generate-migration';
import { revertMigrationCommand } from './revert-migration/revert-migration';
import { runMigrationCommand } from './run-migration/run-migration';

const cancelledMessage = 'Migrate cancelled.';

export async function migrateCommand() {
    // eslint-disable-next-line no-console
    console.log(`\n`);
    intro(pc.blue('🛠️ Firelancer migrations'));
    const action = await select({
        message: 'What would you like to do?',
        options: [
            { value: 'generate', label: 'Generate a new migration' },
            { value: 'run', label: 'Run pending migrations' },
            { value: 'revert', label: 'Revert the last migration' },
        ],
    });
    if (isCancel(action)) {
        cancel(cancelledMessage);
        process.exit(0);
    }
    try {
        process.env.FIRELANCER_RUNNING_IN_CLI = 'true';
        if (action === 'generate') {
            await generateMigrationCommand.run();
        }
        if (action === 'run') {
            await runMigrationCommand.run();
        }
        if (action === 'revert') {
            await revertMigrationCommand.run();
        }
        outro('✅ Done!');
        process.env.FIRELANCER_RUNNING_IN_CLI = undefined;
    } catch (e: any) {
        log.error(e.message as string);
        if (e.stack) {
            log.error(e.stack);
        }
    }
}
