import { FirelancerConfig } from '@firelancer/core';
import path from 'node:path';
import { register } from 'ts-node';
import { FirelancerConfigRef } from '../shared/firelancer-config-ref';
import { selectTsConfigFile } from '../utilities/ast-utils';
import { isRunningInTsNode } from '../utilities/utils';

export async function loadFirelancerConfigFile(
    firelancerConfig: FirelancerConfigRef,
    providedTsConfigPath?: string,
): Promise<FirelancerConfig> {
    await import('dotenv/config');
    if (!isRunningInTsNode()) {
        let tsConfigPath: string;
        if (providedTsConfigPath) {
            tsConfigPath = providedTsConfigPath;
        } else {
            const tsConfigFile = await selectTsConfigFile();
            tsConfigPath = path.join(process.cwd(), tsConfigFile);
        }
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const compilerOptions = require(tsConfigPath).compilerOptions;
        register({
            compilerOptions: { ...compilerOptions, moduleResolution: 'NodeNext', module: 'NodeNext' },
            transpileOnly: true,
        });
        if (compilerOptions.paths) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const tsConfigPaths = require('tsconfig-paths');
            tsConfigPaths.register({
                baseUrl: './',
                paths: compilerOptions.paths,
            });
        }
    }
    const exportedVarName = firelancerConfig.getConfigObjectVariableName();
    if (!exportedVarName) {
        throw new Error('Could not find the exported variable name in the FirelancerConfig file');
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require(firelancerConfig.sourceFile.getFilePath())[exportedVarName];
    return config;
}
