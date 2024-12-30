import { cancel, isCancel, multiselect, select, spinner } from '@clack/prompts';
import { ClassDeclaration, Project } from 'ts-morph';
import { Messages } from '../../constants';
import { getPluginClasses, getTsMorphProject, selectTsConfigFile } from '../utilities/ast-utils';
import { pauseForPromptDisplay } from '../utilities/utils';
import { EntityRef } from './entity-ref';
import { FirelancerPluginRef } from './firelancer-plugin-ref';
import { ServiceRef } from './service-ref';

export async function analyzeProject(options: { providedFirelancerPlugin?: FirelancerPluginRef; cancelledMessage?: string }) {
    const providedFirelancerPlugin = options.providedFirelancerPlugin;
    let project = providedFirelancerPlugin?.classDeclaration.getProject();
    let tsConfigPath: string | undefined;

    if (!providedFirelancerPlugin) {
        const projectSpinner = spinner();
        const tsConfigFile = await selectTsConfigFile();
        projectSpinner.start('Analyzing project...');
        await pauseForPromptDisplay();
        const { project: _project, tsConfigPath: _tsConfigPath } = await getTsMorphProject({}, tsConfigFile);
        project = _project;
        tsConfigPath = _tsConfigPath;
        projectSpinner.stop('Project analyzed');
    }
    return { project: project as Project, tsConfigPath };
}

export async function selectPlugin(project: Project, cancelledMessage: string): Promise<FirelancerPluginRef> {
    const pluginClasses = getPluginClasses(project);
    if (pluginClasses.length === 0) {
        cancel(Messages.NoPluginsFound);
        process.exit(0);
    }
    const targetPlugin = await select({
        message: 'To which plugin would you like to add the feature?',
        options: pluginClasses.map((c) => ({
            value: c,
            label: c.getName() as string,
        })),
        maxItems: 10,
    });
    if (isCancel(targetPlugin)) {
        cancel(cancelledMessage);
        process.exit(0);
    }
    return new FirelancerPluginRef(targetPlugin as ClassDeclaration);
}

export async function selectEntity(plugin: FirelancerPluginRef): Promise<EntityRef> {
    const entities = plugin.getEntities();
    if (entities.length === 0) {
        throw new Error(Messages.NoEntitiesFound);
    }
    const targetEntity = await select({
        message: 'Select an entity',
        options: entities
            .filter((e) => !e.isTranslation())
            .map((e) => ({
                value: e,
                label: e.name,
            })),
        maxItems: 10,
    });
    if (isCancel(targetEntity)) {
        cancel('Cancelled');
        process.exit(0);
    }
    return targetEntity as EntityRef;
}

export async function selectMultiplePluginClasses(project: Project, cancelledMessage: string): Promise<FirelancerPluginRef[]> {
    const pluginClasses = getPluginClasses(project);
    if (pluginClasses.length === 0) {
        cancel(Messages.NoPluginsFound);
        process.exit(0);
    }
    const selectAll = await select({
        message: 'To which plugin would you like to add the feature?',
        options: [
            {
                value: 'all',
                label: 'All plugins',
            },
            {
                value: 'specific',
                label: 'Specific plugins (you will be prompted to select the plugins)',
            },
        ],
    });
    if (isCancel(selectAll)) {
        cancel(cancelledMessage);
        process.exit(0);
    }
    if (selectAll === 'all') {
        return pluginClasses.map((pc) => new FirelancerPluginRef(pc));
    }
    const targetPlugins = await multiselect({
        message: 'Select one or more plugins (use ↑, ↓, space to select)',
        options: pluginClasses.map((c) => ({
            value: c,
            label: c.getName() as string,
        })),
    });
    if (isCancel(targetPlugins)) {
        cancel(cancelledMessage);
        process.exit(0);
    }
    return (targetPlugins as ClassDeclaration[]).map((pc) => new FirelancerPluginRef(pc));
}

export function getServices(project: Project): ServiceRef[] {
    const servicesSourceFiles = project.getSourceFiles().filter((sf) => {
        return sf.getDirectory().getPath().endsWith('/services') || sf.getDirectory().getPath().endsWith('/service');
    });

    return servicesSourceFiles
        .flatMap((sf) => sf.getClasses())
        .filter((classDeclaration) => classDeclaration.getDecorator('Injectable'))
        .map((classDeclaration) => new ServiceRef(classDeclaration));
}
