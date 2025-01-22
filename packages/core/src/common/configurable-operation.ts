/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigArgType, ID, assertNever } from '@firelancer/common';
import { ConfigArg } from '../api';
import { InternalServerError } from './error/errors';
import { InjectableStrategy } from './injectable-strategy';
import { Injector } from './injector';

export interface ConfigArgCommonDef<T extends ConfigArgType> {
    type: T;
    required?: boolean;
    defaultValue?: ConfigArgTypeToTsType<T>;
    list?: boolean;
    label?: string;
    description?: string;
}

export type ConfigArgListDef<T extends ConfigArgType, C extends ConfigArgCommonDef<T> = ConfigArgCommonDef<T>> = C & {
    list: true;
};

export type WithArgConfig<T> = {
    config?: T;
};

export type StringArgConfig = WithArgConfig<{
    options?: { label?: string; value: string }[];
}>;
export type IntArgConfig = WithArgConfig<{
    inputType?: 'default' | 'percentage' | 'money';
}>;

export type ConfigArgDef<T extends ConfigArgType> = T extends 'string'
    ? ConfigArgCommonDef<'string'> & StringArgConfig
    : T extends 'int'
      ? ConfigArgCommonDef<'int'> & IntArgConfig
      : ConfigArgCommonDef<T> & WithArgConfig<never>;

/**
 * @description
 * A object which defines the configurable arguments which may be passed to
 * functions in those classes which implement the ConfigurableOperationDef interface.
 *
 * ## Data types
 * Each argument has a data type, which must be one of ConfigArgType.
 *
 * @example
 * ```ts
 * {
 *   apiKey: { type: 'string' },
 *   maxRetries: { type: 'int' },
 *   logErrors: { type: 'boolean' },
 * }
 * ```
 *
 * ## Lists
 * Setting the `list` property to `true` will make the argument into an array of the specified
 * data type. For example, if you want to store an array of strings:
 *
 * @example
 * ```ts
 * {
 *   aliases: {
 *     type: 'string',
 *     list: true,
 *   },
 * }
 *```
 */
export type ConfigArgs = {
    [name: string]: ConfigArgDef<ConfigArgType>;
};

/**
 * Represents the ConfigArgs once they have been coerced into JavaScript values for use
 * in business logic.
 */
export type ConfigArgValues<T extends ConfigArgs> = {
    [K in keyof T]: ConfigArgDefToType<T[K]>;
};

/**
 * Converts a ConfigArgDef to a TS type, e.g:
 *
 * ConfigArgListDef<'datetime'> -> Date[]
 * ConfigArgDef<'boolean'> -> boolean
 */
export type ConfigArgDefToType<D extends ConfigArgDef<ConfigArgType>> =
    D extends ConfigArgListDef<'int' | 'float'>
        ? number[]
        : D extends ConfigArgDef<'int' | 'float'>
          ? number
          : D extends ConfigArgListDef<'datetime'>
            ? Date[]
            : D extends ConfigArgDef<'datetime'>
              ? Date
              : D extends ConfigArgListDef<'boolean'>
                ? boolean[]
                : D extends ConfigArgDef<'boolean'>
                  ? boolean
                  : D extends ConfigArgListDef<'ID'>
                    ? ID[]
                    : D extends ConfigArgDef<'ID'>
                      ? ID
                      : D extends ConfigArgListDef<'string'>
                        ? string[]
                        : string;

/**
 * Converts a ConfigArgType to a TypeScript type
 *
 * ConfigArgTypeToTsType<'int'> -> number
 */
export type ConfigArgTypeToTsType<T extends ConfigArgType> = T extends 'string'
    ? string
    : T extends 'int'
      ? number
      : T extends 'float'
        ? number
        : T extends 'boolean'
          ? boolean
          : T extends 'datetime'
            ? Date
            : ID;

/**
 * Converts a TS type to a ConfigArgDef, e.g:
 *
 * Date[] -> ConfigArgListDef<'datetime'>
 * boolean -> ConfigArgDef<'boolean'>
 */
export type TypeToConfigArgDef<T extends ConfigArgDefToType<any>> = T extends number
    ? ConfigArgDef<'int' | 'float'>
    : T extends number[]
      ? ConfigArgListDef<'int' | 'float'>
      : T extends Date[]
        ? ConfigArgListDef<'datetime'>
        : T extends Date
          ? ConfigArgDef<'datetime'>
          : T extends boolean[]
            ? ConfigArgListDef<'boolean'>
            : T extends boolean
              ? ConfigArgDef<'boolean'>
              : T extends string[]
                ? ConfigArgListDef<'string'>
                : T extends string
                  ? ConfigArgDef<'string'>
                  : T extends ID[]
                    ? ConfigArgListDef<'ID'>
                    : ConfigArgDef<'ID'>;

/**
 * @description
 * Common configuration options used when creating a new instance of a ConfigurableOperationDef
 */
export interface ConfigurableOperationDefOptions<T extends ConfigArgs> extends InjectableStrategy {
    /**
     * @description
     * A unique code used to identify this operation.
     */
    code: string;
    /**
     * @description
     * Optional provider-specific arguments which, when specified, are editable in adim-ui. For example, args could be used to store an API key
     * for a payment provider service.
     *
     * @example
     * ```ts
     * args: {
     *   apiKey: { type: 'string' },
     * }
     * ```
     *
     * See ConfigArgs for available configuration options.
     */
    args: T;
    /**
     * @description
     * A human-readable description for the operation method.
     */
    description: string;
}

/**
 * @description
 * A ConfigurableOperationDef is a special type of object used extensively by Firelancer to define
 * code blocks which have arguments which are configurable at run-time by the administrator.
 *
 * This is the mechanism used by:
 *
 * * CollectionFilter
 *
 * Any class which extends ConfigurableOperationDef works in the same way: it takes a
 * config object as the constructor argument. That config object extends the ConfigurableOperationDefOptions
 * interface and typically adds some kind of business logic function to it.
 *
 *
 * ## The `args` property
 *
 * The key feature of the ConfigurableOperationDef is the `args` property. This is where we define those
 * arguments that are exposed via the admin-ui as data input components. This allows their values to
 * be set at run-time by the Administrator. Those values can then be accessed in the business logic
 * of the operation.
 *
 * The data type of the args can be one of ConfigArgType.
 *
 * ## Dependency Injection
 * If your business logic relies on injectable providers, such as the `TransactionalConnection` object, or any of the
 * internal Firelancer services or those defined in a plugin, you can inject them by using the config object's
 * `init()` method, which exposes the Injector.
 *
 * Here's an example of a ShippingCalculator that injects a service which has been defined in a plugin:
 *
 * @example
 * ```ts
 * import { Injector, ShippingCalculator } from '\@firelancer/core';
 * import { ShippingRatesService } from './shipping-rates.service';
 *
 * // We keep reference to our injected service by keeping it
 * // in the top-level scope of the file.
 * let shippingRatesService: ShippingRatesService;
 *
 * export const customShippingCalculator = new ShippingCalculator({
 *   code: 'custom-shipping-calculator',
 *   description: [],
 *   args: {},
 *
 *   init(injector: Injector) {
 *     // The init function is called during bootstrap, and allows
 *     // us to inject any providers we need.
 *     shippingRatesService = injector.get(ShippingRatesService);
 *   },
 *
 *   calculate: async (order, args) => {
 *     // We can now use the injected provider in the business logic.
 *     const { price, priceWithTax } = await shippingRatesService.getRate({
 *       destination: order.shippingAddress,
 *       contents: order.lines,
 *     });
 *
 *     return {
 *       price,
 *       priceWithTax,
 *     };
 *   },
 * });
 * ```
 */
export class ConfigurableOperationDef<T extends ConfigArgs = ConfigArgs> {
    get code(): string {
        return this.options.code;
    }
    get args(): T {
        return this.options.args;
    }
    get description(): string {
        return this.options.description;
    }
    constructor(protected options: ConfigurableOperationDefOptions<T>) {}

    async init(injector: Injector) {
        if (typeof this.options.init === 'function') {
            await this.options.init(injector);
        }
    }
    async destroy() {
        if (typeof this.options.destroy === 'function') {
            await this.options.destroy();
        }
    }

    /**
     * @description
     * Coverts an array of ConfigArgs into a hash object:
     *
     * from:
     * `[{ name: 'foo', type: 'string', value: 'bar'}]`
     *
     * to:
     * `{ foo: 'bar' }`
     **/
    protected argsArrayToHash(args: ConfigArg[]): ConfigArgValues<T> {
        const output: ConfigArgValues<T> = {} as any;
        for (const arg of args) {
            if (arg && arg.value != null && this.args[arg.name] != null) {
                output[arg.name as keyof ConfigArgValues<T>] = coerceValueToType<T>(
                    arg.value,
                    this.args[arg.name].type,
                    this.args[arg.name].list || false,
                );
            }
        }
        return output;
    }
}

function coerceValueToType<T extends ConfigArgs>(
    value: string,
    type: ConfigArgType,
    isList: boolean,
): ConfigArgValues<T>[keyof T] {
    if (isList) {
        try {
            return (JSON.parse(value) as string[]).map((v) => coerceValueToType(v, type, false)) as any;
        } catch (err: any) {
            throw new InternalServerError(`Could not parse list value "${value}": ` + JSON.stringify(err.message));
        }
    }
    switch (type) {
        case 'string':
            return value as any;
        case 'int':
            return Number.parseInt(value || '', 10) as any;
        case 'float':
            return Number.parseFloat(value || '') as any;
        case 'datetime':
            return Date.parse(value || '') as any;
        case 'boolean':
            return !!(value && (value.toLowerCase() === 'true' || value === '1')) as any;
        case 'ID':
            return value as any;
        default:
            assertNever(type);
    }
}
