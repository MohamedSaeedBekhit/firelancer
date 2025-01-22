import {
    BooleanOperators,
    DateOperators,
    LogicalOperator,
    NumberOperators,
    StringOperators,
    Type,
} from '@firelancer/common';
import { FirelancerEntity } from '../entity';
import { Request, Response } from 'express';

export type MiddlewareHandler = Type<unknown> | ((req: Request, res: Response, next: () => void) => void);

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

/**
 * Parameters for list queries
 */
export interface ListQueryOptions<T extends FirelancerEntity> {
    take?: number | null;
    skip?: number | null;
    sort?: NullOptionals<SortParameter<T>> | null;
    filter?: NullOptionals<FilterParameter<T>> | null;
    filterOperator?: LogicalOperator;
}

/**
 * Returns a type T where any optional fields also have the "null" type added.
 * This is needed to provide interop with the Apollo-generated interfaces, where
 * nullable fields have the type `field?: <type> | null`.
 */
export type NullOptionals<T> = {
    [K in keyof T]: undefined extends T[K] ? NullOptionals<T[K]> | null : NullOptionals<T[K]>;
};

export type SortOrder = 'ASC' | 'DESC';

// prettier-ignore
export type PrimitiveFields<T extends FirelancerEntity> = {
    [K in keyof T]: NonNullable<T[K]> extends  number | string | boolean | Date ? K : never
}[keyof T];

// prettier-ignore
export type SortParameter<T extends FirelancerEntity> = {
    [K in PrimitiveFields<T>]?: SortOrder
};

// prettier-ignore
export type CustomFieldSortParameter = {
    [customField: string]: SortOrder;
};

// prettier-ignore
export type FilterParameter<T extends FirelancerEntity> = {
    [K in PrimitiveFields<T>]?: 
    T[K] extends string  ? StringOperators :
    T[K] extends number ? NumberOperators :
    T[K] extends boolean ? BooleanOperators :
    T[K] extends Date ? DateOperators : StringOperators;
} & {
    _and?: Array<FilterParameter<T>>;
    _or?: Array<FilterParameter<T>>;
};

export interface ListOperators {
    inList?: string | number | boolean | Date;
}

export type EntityRelationPaths<T extends FirelancerEntity> =
    | `customFields.${string}`
    | PathsToStringProps1<T>
    | Join<PathsToStringProps2<T>, '.'>
    | TripleDotPath;

export type EntityRelationKeys<T extends FirelancerEntity> = {
    [K in Extract<keyof T, string>]: Required<T>[K] extends FirelancerEntity | null
        ? K
        : Required<T>[K] extends FirelancerEntity[]
          ? K
          : never;
}[Extract<keyof T, string>];

export type EntityRelations<T extends FirelancerEntity> = {
    [K in EntityRelationKeys<T>]: T[K];
};

export type PathsToStringProps1<T extends FirelancerEntity> = T extends string
    ? []
    : {
          [K in EntityRelationKeys<T>]: K;
      }[Extract<EntityRelationKeys<T>, string>];

export type PathsToStringProps2<T extends FirelancerEntity> = T extends string
    ? never
    : {
          [K in EntityRelationKeys<T>]: T[K] extends FirelancerEntity[]
              ? [K, PathsToStringProps1<T[K][number]>]
              : T[K] extends FirelancerEntity | undefined
                ? [K, PathsToStringProps1<NonNullable<T[K]>>]
                : never;
      }[Extract<EntityRelationKeys<T>, string>];

export type TripleDotPath = `${string}.${string}.${string}`;

// Based on https://stackoverflow.com/a/47058976/772859
export type Join<T extends Array<string | unknown>, D extends string> = T extends []
    ? never
    : T extends [infer F]
      ? F
      : T extends [infer F, ...infer R]
        ? F extends string
            ? `${F}${D}${Join<Extract<R, string[]>, D>}`
            : never
        : string;
