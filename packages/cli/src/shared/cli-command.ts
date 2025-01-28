import { Project, SourceFile } from 'ts-morph';
import { FirelancerPluginRef } from './firelancer-plugin-ref';

export type CommandCategory =
    | `Plugin`
    | `Plugin: UI`
    | `Plugin: Entity`
    | `Plugin: Service`
    | `Plugin: API`
    | `Plugin: Job Queue`
    | `Other`;

export interface BaseCliCommandOptions {
    plugin?: FirelancerPluginRef;
}

export type CliCommandReturnVal<T extends Record<string, unknown> = Record<string, unknown>> = {
    project: Project;
    modifiedSourceFiles: SourceFile[];
} & T;

export interface CliCommandOptions<T extends BaseCliCommandOptions, R extends CliCommandReturnVal> {
    id: string;
    category: CommandCategory;
    description: string;
    run: (options?: Partial<T>) => Promise<R>;
}

export class CliCommand<T extends Record<string, unknown>, R extends CliCommandReturnVal = CliCommandReturnVal> {
    constructor(private options: CliCommandOptions<T, R>) {}

    get id() {
        return this.options.id;
    }

    get category() {
        return this.options.category;
    }

    get description() {
        return this.options.description;
    }

    run(options?: Partial<T>): Promise<R> {
        return this.options.run(options);
    }
}
