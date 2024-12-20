/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-function-type */

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

export type Json =
    | null
    | boolean
    | number
    | string
    | Json[]
    | {
          [prop: string]: Json;
      };

export type JsonCompatible<T> = {
    [P in keyof T]: T[P] extends Json ? T[P] : Pick<T, P> extends Required<Pick<T, P>> ? never : JsonCompatible<T[P]>;
};

export type MiddlewareHandler = Type<any> | Function;

export interface Middleware {
    /**
     * @description
     * The Express middleware function or NestJS `NestMiddleware` class.
     */
    handler: MiddlewareHandler;
    /**
     * @description
     * The route to which this middleware will apply. Pattern based routes are supported as well.
     *
     * The `'ab*cd'` route path will match `abcd`, `ab_cd`, `abecd`, and so on. The characters `?`, `+`, `*`, and `()` may be used in a route path,
     * and are subsets of their regular expression counterparts. The hyphen (`-`) and the dot (`.`) are interpreted literally.
     */
    route: string;
}

export type ID = number;

/**
 * @description
 * Entities which can be soft deleted should implement this interface.
 */
export interface SoftDeletable {
    deletedAt: Date | null;
}

/**
 * @description
 * Entities which can be drafted and published later should implement this interface.
 */
export interface Draftable {
    publishedAt: Date | null;
}

/**
 * @description
 * Entities which can be ordered relative to their siblings in a list.
 */
export interface Orderable {
    position: number;
}

export enum CustomerType {
    SELLER = 'SELLER',
    BUYER = 'BUYER',
}

export enum Permission {
    /** Authenticated means simply that the user is logged in */
    Authenticated = 'Authenticated',
    /** Grants permission to create Administrator */
    CreateAdministrator = 'CreateAdministrator',
    /** Grants permission to create Asset */
    CreateAsset = 'CreateAsset',
    /** Grants permission to create Customer */
    CreateCustomer = 'CreateCustomer',
    /** Grants permission to create JobPost */
    CreateJobPost = 'CreateJobPost',
    /** Grants permission to create Facet */
    CreateFacet = 'CreateFacet',
    /** Grants permission to delete Administrator */
    DeleteAdministrator = 'DeleteAdministrator',
    /** Grants permission to delete Asset */
    DeleteAsset = 'DeleteAsset',
    /** Grants permission to delete Customer */
    DeleteCustomer = 'DeleteCustomer',
    /** Grants permission to delete JobPost */
    DeleteJobPost = 'DeleteJobPost',
    /** Grants permission to delete Facet */
    DeleteFacet = 'DeleteFacet',
    /** Owner means the user owns this entity, e.g. a Customer's own Order */
    Owner = 'Owner',
    /** Public means any unauthenticated user may perform the operation */
    Public = 'Public',
    /** Grants permission to read Administrator */
    ReadAdministrator = 'ReadAdministrator',
    /** Grants permission to read Asset */
    ReadAsset = 'ReadAsset',
    /** Grants permission to read Customer */
    ReadCustomer = 'ReadCustomer',
    /** Grants permission to read JobPost */
    ReadJobPost = 'ReadJobPost',
    /** Grants permission to read Facet */
    ReadFacet = 'ReadFacet',
    /** SuperAdmin has unrestricted access to all operations */
    SuperAdmin = 'SuperAdmin',
    /** Grants permission to update Administrator */
    UpdateAdministrator = 'UpdateAdministrator',
    /** Grants permission to update Asset */
    UpdateAsset = 'UpdateAsset',
    /** Grants permission to update Customer */
    UpdateCustomer = 'UpdateCustomer',
    /** Grants permission to update JobPost */
    UpdateJobPost = 'UpdateJobPost',
    /** Grants permission to update Facet */
    UpdateFacet = 'UpdateFacet',
}

export enum HistoryEntryType {
    CUSTOMER_EMAIL_UPDATE_REQUESTED = 'CUSTOMER_EMAIL_UPDATE_REQUESTED',
    CUSTOMER_EMAIL_UPDATE_VERIFIED = 'CUSTOMER_EMAIL_UPDATE_VERIFIED',
    CUSTOMER_DETAIL_UPDATED = 'CUSTOMER_DETAIL_UPDATED',
    CUSTOMER_PASSWORD_RESET_REQUESTED = 'CUSTOMER_PASSWORD_RESET_REQUESTED',
    CUSTOMER_PASSWORD_RESET_VERIFIED = 'CUSTOMER_PASSWORD_RESET_VERIFIED',
    CUSTOMER_PASSWORD_UPDATED = 'CUSTOMER_PASSWORD_UPDATED',
    CUSTOMER_REGISTERED = 'CUSTOMER_REGISTERED',
    CUSTOMER_VERIFIED = 'CUSTOMER_VERIFIED',
}

export enum AssetType {
    BINARY = 'BINARY',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
}

export enum BalanceEntryType {
    FIXED_PRICE = 'FIXED_PRICE',
    BONUS = 'BONUS',
    PAYMENT = 'PAYMENT',
    WITHDRAWAL = 'WITHDRAWAL',
}

export enum BalanceEntryStatus {
    PENDING = 'PENDING',
    SETTELABLE = 'SETTELABLE',
    SETTLED = 'SETTLED',
}

/**
 * @description
 * The state of a Job in the JobQueue
 */
export enum JobState {
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
    RETRYING = 'RETRYING',
    RUNNING = 'RUNNING',
}

/**
 * @description
 * Certain entities (those which implement ConfigurableOperationDef) allow arbitrary
 * configuration arguments to be specified which can then be set in the admin-ui and used in
 * the business logic of the app. These are the valid data types of such arguments.
 * The data type influences:
 *
 * 1. How the argument form field is rendered in the admin-ui
 * 2. The JavaScript type into which the value is coerced before being passed to the business logic.
 */
export type ConfigArgType = 'string' | 'int' | 'float' | 'boolean' | 'datetime' | 'ID';
