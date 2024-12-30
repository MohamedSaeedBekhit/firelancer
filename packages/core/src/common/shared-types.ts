import { Type } from '@firelancer/common';

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
