import { log, spinner } from '@clack/prompts';
import { revertLastMigration } from '@firelancer/core';
import { CliCommand, CliCommandReturnVal } from '../../shared/cli-command';
import { analyzeProject } from '../../shared/shared-prompts';
import { FirelancerConfigRef } from '../../shared/firelancer-config-ref';
import { loadFirelancerConfigFile } from '../load-firelancer-config-file';

const cancelledMessage = 'Revert migrations cancelled';

export const revertMigrationCommand = new CliCommand({
    id: 'run-migration',
    category: 'Other',
    description: 'Run any pending database migrations',
    run: () => runRevertMigration(),
});

async function runRevertMigration(): Promise<CliCommandReturnVal> {
    const { project } = await analyzeProject({ cancelledMessage });
    const firelancerConfig = new FirelancerConfigRef(project);
    log.info('Using FirelancerConfig from ' + firelancerConfig.getPathRelativeToProjectRoot());
    const config = await loadFirelancerConfigFile(firelancerConfig);

    const runSpinner = spinner();
    runSpinner.start('Reverting last migration...');
    await revertLastMigration(config);
    runSpinner.stop(`Successfully reverted last migration`);
    return {
        project,
        modifiedSourceFiles: [],
    };
}
