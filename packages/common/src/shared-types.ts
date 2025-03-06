/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-function-type */

import { LanguageCode } from './shared-schema';

export interface Type<T = any> extends Function {
    new (...args: any[]): T;
}

/**
 * Same as Partial<T> but goes deeper and makes Partial<T> all its properties and sub-properties.
 */
export type DeepPartial<T> =
    | T
    | (T extends Array<infer U>
          ? DeepPartial<U>[]
          : T extends Map<infer K, infer V>
            ? Map<DeepPartial<K>, DeepPartial<V>>
            : T extends Set<infer M>
              ? Set<DeepPartial<M>>
              : T extends object
                ? {
                      [K in keyof T]?: DeepPartial<T[K]>;
                  }
                : T);

/**
 * A recursive implementation of Required<T>.
 * Source: https://github.com/microsoft/TypeScript/issues/15012#issuecomment-365453623
 */
export type DeepRequired<T, U extends object | undefined = undefined> = T extends object
    ? {
          [P in keyof T]-?: NonNullable<T[P]> extends NonNullable<U | Function | Type<any>>
              ? NonNullable<T[P]>
              : DeepRequired<NonNullable<T[P]>, U>;
      }
    : T;

export type TimeSpanUnit = 'ms' | 's' | 'm' | 'h' | 'd' | 'w';

export class TimeSpan {
    constructor(value: number, unit: TimeSpanUnit) {
        this.value = value;
        this.unit = unit;
    }

    public value: number;
    public unit: TimeSpanUnit;

    public milliseconds(): number {
        if (this.unit === 'ms') {
            return this.value;
        }
        if (this.unit === 's') {
            return this.value * 1000;
        }
        if (this.unit === 'm') {
            return this.value * 1000 * 60;
        }
        if (this.unit === 'h') {
            return this.value * 1000 * 60 * 60;
        }
        if (this.unit === 'd') {
            return this.value * 1000 * 60 * 60 * 24;
        }
        return this.value * 1000 * 60 * 60 * 24 * 7;
    }

    public seconds(): number {
        return this.milliseconds() / 1000;
    }

    public transform(x: number): TimeSpan {
        return new TimeSpan(Math.round(this.milliseconds() * x), 'ms');
    }
}

export function isWithinExpirationDate(date: Date): boolean {
    return Date.now() < date.getTime();
}

export function createDate(timeSpan: TimeSpan): Date {
    return new Date(Date.now() + timeSpan.milliseconds());
}

export type LocalizedString = {
    languageCode: LanguageCode;
    value: string;
};

export enum LogicalOperator {
    AND = 'AND',
    OR = 'OR',
}

/** Operators for filtering on a String field */
export type StringOperators = {
    contains?: string;
    eq?: string;
    in?: string;
    isNull?: boolean;
    notContains?: string;
    notEq?: string;
    notIn?: Array<string>;
    regex?: string;
};

/** Operators for filtering on a Int or Float field */
export type NumberOperators = {
    between?: NumberRange;
    eq?: number;
    gt?: number;
    gte?: number;
    isNull?: boolean;
    lt?: number;
    lte?: number;
};

export type NumberRange = {
    end: number;
    start: number;
};

/** Operators for filtering on a Boolean field */
export type BooleanOperators = {
    eq?: boolean;
    isNull?: boolean;
};

/** Operators for filtering on a DateTime field */
export type DateOperators = {
    after?: Date;
    before?: Date;
    between?: DateRange;
    eq?: Date;
    isNull?: boolean;
};

export type DateRange = {
    end: Date;
    start: Date;
};

export type IdOperators = {
    eq?: string;
    in?: Array<string>;
    isNull?: boolean;
    notEq?: string;
    notIn?: Array<string>;
};

export type TypedArray =
    | Uint8Array
    | Int8Array
    | Uint16Array
    | Int16Array
    | Uint32Array
    | Int32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array;

export type Json =
    | null
    | boolean
    | number
    | string
    | Json[]
    | {
          [prop: string]: Json;
      };

/**
 * @description
 * A type representing JSON-compatible values.
 */
export type JsonCompatible<T> = {
    [P in keyof T]: T[P] extends Json ? T[P] : Pick<T, P> extends Required<Pick<T, P>> ? never : JsonCompatible<T[P]>;
};

/**
 * @description
 * A type describing the shape of a paginated list response. In Firelancer, almost all list queries
 * (`collections`, `orders`, `customers` etc) return an object of this type.
 */
export type PaginatedList<T> = {
    items: T[];
    totalItems: number;
};

/**
 * @description
 * This interface describes JSON config file (firelancer-ui-config.json) used by the Admin UI.
 * The values are loaded at run-time by the Admin UI app, and allow core configuration to be
 * managed without the need to re-build the application.
 */
export interface AdminUiConfig {
    /**
     * @description
     * The hostname of the Firelancer server which the admin UI will be making API calls
     * to. If set to "auto", the Admin UI app will determine the hostname from the
     * current location (i.e. `window.location.hostname`).
     *
     * @default 'auto'
     */
    apiHost: string | 'auto';
    /**
     * @description
     * The port of the Firelancer server which the admin UI will be making API calls
     * to. If set to "auto", the Admin UI app will determine the port from the
     * current location (i.e. `window.location.port`).
     *
     * @default 'auto'
     */
    apiPort: number | 'auto';
    /**
     * @description
     * The path to the REST Admin API.
     *
     * @default 'admin-api'
     */
    adminApiPath: string;
    /**
     * @description
     * Whether to use cookies or bearer tokens to track sessions.
     * Should match the setting of in the server's `tokenMethod` config
     * option.
     *
     * @default 'cookie'
     */
    tokenMethod: 'cookie' | 'bearer';
    /**
     * @description
     * The header used when using the 'bearer' auth method. Should match the
     * setting of the server's `authOptions.authTokenHeaderKey` config option.
     *
     * @default 'firelancer-auth-token'
     */
    authTokenHeaderKey: string;
    /**
     * @description
     * If you are using an external {@link AuthenticationStrategy} for the Admin API, you can configure
     * a custom URL for the login page with this option. On logging out or redirecting an unauthenticated
     * user, the Admin UI app will redirect the user to this URL rather than the default username/password
     * screen.
     */
    loginUrl?: string;
    /**
     * @description
     * The custom brand name.
     */
    brand?: string;
    /**
     * @description
     * Option to hide firelancer branding.
     *
     * @default false
     */
    hideFirelancerBranding?: boolean;
    /**
     * @description
     * Option to hide version.
     *
     * @default false
     */
    hideVersion?: boolean;
    /**
     * @description
     * The default language for the Admin UI. Must be one of the
     * items specified in the `availableLanguages` property.
     *
     * @default LanguageCode.en
     */
    defaultLanguage: LanguageCode;
    /**
     * @description
     * The default locale for the Admin UI. The locale affects the formatting of
     * currencies & dates. Must be one of the items specified
     * in the `availableLocales` property.
     *
     * If not set, the browser default locale will be used.
     */
    defaultLocale?: string;
    /**
     * @description
     * An array of languages for which translations exist for the Admin UI.
     */
    availableLanguages: LanguageCode[];
    /**
     * @description
     * An array of locales to be used on Admin UI.
     */
    availableLocales: string[];
}

/**
 * @description
 * Configures the path to a custom-build of the Admin UI app.
 */
export interface AdminUiAppConfig {
    /**
     * @description
     * The path to the compiled admin UI app files. If not specified, an internal
     * default build is used. This path should contain the `firelancer-ui-config.json` file,
     * index.html, the compiled js bundles etc.
     */
    path: string;
    /**
     * @description
     * Specifies the url route to the Admin UI app.
     *
     * @default 'admin'
     */
    route?: string;
    /**
     * @description
     * The function which will be invoked to start the app compilation process.
     */
    compile?: () => Promise<void>;
}

/**
 * @description
 * Information about the Admin UI app dev server.
 */
export interface AdminUiAppDevModeConfig {
    /**
     * @description
     * The path to the uncompiled UI app source files. This path should contain the `firelancer-ui-config.json` file.
     */
    sourcePath: string;
    /**
     * @description
     * The port on which the dev server is listening. Overrides the value set by `AdminUiOptions.port`.
     */
    port: number;
    /**
     * @description
     * Specifies the url route to the Admin UI app.
     *
     * @default 'admin'
     */
    route?: string;
    /**
     * @description
     * The function which will be invoked to start the app compilation process.
     */
    compile: () => Promise<void>;
}
