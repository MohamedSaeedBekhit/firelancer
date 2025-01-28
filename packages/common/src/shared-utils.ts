import { Observable, Observer, lastValueFrom } from 'rxjs';
import { TypedArray } from './shared-types';
import { ID, AssetType } from './shared-schema';

/**
 * Identity function which asserts to the type system that a promise which can resolve to T or undefined
 * does in fact resolve to T.
 * Used when performing a "find" operation on an entity which we are sure exists, as in the case that we
 * just successfully created or updated it.
 */
export function assertFound<T>(promise: Promise<T | undefined | null>): Promise<T> {
    return promise as Promise<T>;
}

/**
 * Used in exhaustiveness checks to assert a codepath should never be reached.
 */
export function assertNever(value: never): never {
    throw new Error(`Expected never, got ${typeof value} (${JSON.stringify(value)})`);
}

/**
 * @description
 * Returns an observable which executes the given async work function and completes with
 * the returned value. This is useful in methods which need to return
 * an Observable but also want to work with async (Promise-returning) code.
 *
 * @example
 * ```ts
 * \@Controller()
 * export class MyWorkerController {
 *
 *     \@MessagePattern('test')
 *     handleTest() {
 *         return asyncObservable(async observer => {
 *             const value = await this.connection.fetchSomething();
 *             return value;
 *         });
 *     }
 * }
 * ```
 */
export function asyncObservable<T>(work: (observer: Observer<T>) => Promise<T | void>): Observable<T> {
    return new Observable<T>((subscriber) => {
        void (async () => {
            try {
                const result = await work(subscriber);
                if (result) {
                    subscriber.next(result);
                }
                subscriber.complete();
            } catch (e) {
                subscriber.error(e);
            }
        })();
    });
}

/**
 * Converts a value that may be wrapped into a Promise or Observable into a Promise-wrapped
 * value.
 */
export async function awaitPromiseOrObservable<T>(value: T | Promise<T> | Observable<T>): Promise<T> {
    let result = await value;
    if (result instanceof Observable) {
        result = await lastValueFrom(result);
    }
    return result;
}

export function byteToBinary(byte: number): string {
    return byte.toString(2).padStart(8, '0');
}

export function bytesToBinary(bytes: Uint8Array): string {
    return [...bytes].map((val) => byteToBinary(val)).join('');
}

export function binaryToInteger(bits: string): number {
    return parseInt(bits, 2);
}

export function bytesToInteger(bytes: Uint8Array): number {
    return parseInt(bytesToBinary(bytes), 2);
}

export function compareBytes(buffer1: ArrayBuffer | TypedArray, buffer2: ArrayBuffer | TypedArray): boolean {
    const bytes1 = new Uint8Array(buffer1);
    const bytes2 = new Uint8Array(buffer2);
    if (bytes1.byteLength !== bytes2.byteLength) return false;
    for (let i = 0; i < bytes1.byteLength; i++) {
        if (bytes1[i] !== bytes2[i]) return false;
    }
    return true;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export type PlainObject = { [key in string | number | symbol]: unknown };

/** Returns the object type of the given payload */
export function getType(payload: unknown): string {
    return Object.prototype.toString.call(payload).slice(8, -1);
}

export function isArray(payload: unknown): payload is unknown[] {
    return getType(payload) === 'Array';
}

/**
 * Returns whether the payload is a plain JavaScript object (excluding special classes or objects
 * with other prototypes)
 */
export function isPlainObject(payload: unknown): payload is PlainObject {
    if (getType(payload) !== 'Object') return false;
    const prototype = Object.getPrototypeOf(payload);
    return !!prototype && prototype.constructor === Object && prototype === Object.prototype;
}

export type Options = { props?: (string | symbol)[]; nonenumerable?: boolean };

/**
 * Copy (clone) an object and all its props recursively to get rid of any prop referenced of the original object. Arrays are also cloned, however objects inside arrays are still linked.
 *
 * @param target Target can be anything
 * @param [options = {}] Options can be `props` or `nonenumerable`
 * @returns the target with replaced values
 */
export function copy<T>(target: T, options: Options = {}): T {
    if (isArray(target)) {
        return target.map((item) => copy(item, options)) as any;
    }

    if (!isPlainObject(target)) {
        return target;
    }

    const props = Object.getOwnPropertyNames(target);
    const symbols = Object.getOwnPropertySymbols(target);

    return [...props, ...symbols].reduce<any>((carry, key) => {
        if (isArray(options.props) && !options.props.includes(key)) {
            return carry;
        }
        const val = (target as any)[key];
        const newVal = copy(val, options);
        assignProp(carry, key, newVal, target, options.nonenumerable);
        return carry;
    }, {} as T);
}

function assignProp(
    carry: PlainObject,
    key: string | symbol,
    newVal: any,
    originalObject: PlainObject,
    includeNonenumerable?: boolean,
): void {
    const propType = {}.propertyIsEnumerable.call(originalObject, key) ? 'enumerable' : 'nonenumerable';
    if (propType === 'enumerable') carry[key as any] = newVal;
    if (includeNonenumerable && propType === 'nonenumerable') {
        Object.defineProperty(carry, key, {
            value: newVal,
            enumerable: false,
            writable: true,
            configurable: true,
        });
    }
}

/**
 * Returns a predicate function which returns true if the item is found in the set,
 * as determined by a === equality check on the given compareBy property.
 */
export function foundIn<T>(set: T[], compareBy: keyof T) {
    return (item: T) => set.some((t) => t[compareBy] === item[compareBy]);
}

/**
 * Returns the AssetType based on the mime type.
 */
export function getAssetType(mimeType: string): AssetType {
    const type = mimeType.split('/')[0];
    switch (type) {
        case 'image':
            return AssetType.IMAGE;
        case 'video':
            return AssetType.VIDEO;
        default:
            return AssetType.BINARY;
    }
}

/**
 * Compare ID values for equality, taking into account the fact that they may not be of matching types
 * (string or number).
 */
export function idsAreEqual(id1?: ID, id2?: ID): boolean {
    if (id1 === undefined || id2 === undefined) {
        return false;
    }
    return id1.toString() === id2.toString();
}

function many(sets: any[][]): any[] {
    const o: Record<string | number, number> = {};
    const l = sets.length - 1;
    const first = sets[0];
    const last = sets[l];

    // Initialize the map with keys from the first set
    for (const item of first) {
        o[item] = 0;
    }

    // Update the map based on each subsequent set
    for (let i = 1; i <= l; i++) {
        const row = sets[i];
        for (const key of row) {
            if (o[key] === i - 1) {
                o[key] = i;
            }
        }
    }

    // Collect the result from the last set
    const a: any[] = [];
    for (const key of last) {
        if (o[key] === l) {
            a.push(key);
        }
    }

    return a;
}

function intersect<T>(a: T[], b?: T[]): T[] {
    if (!b) {
        return many(a as any[][]);
    }

    const res: T[] = [];
    for (const item of a) {
        if (indexOf(b, item) > -1) {
            res.push(item);
        }
    }
    return res;
}

intersect.big = function <T>(a: T[], b?: T[]): T[] {
    if (!b) {
        return many(a as any[][]);
    }

    const ret: T[] = [];
    const temp: Record<string | number, boolean> = {};

    for (const item of b) {
        temp[item as any] = true;
    }
    for (const item of a) {
        if (temp[item as any]) {
            ret.push(item);
        }
    }

    return ret;
};

function indexOf<T>(arr: T[], el: T): number {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === el) {
            return i;
        }
    }
    return -1;
}

export default intersect;
export { intersect };

export function isObject(item: any): item is object {
    return item && typeof item === 'object' && !Array.isArray(item);
}

export function isClassInstance(item: unknown): boolean {
    // Even if item is an object, it might not have a constructor as in the
    // case when it is a null-prototype object, i.e. created using `Object.create(null)`.
    return isObject(item) && item.constructor && item.constructor.name !== 'Object';
}

/**
 * A simple normalization for email addresses. Lowercases the whole address,
 * even though technically the local part (before the '@') is case-sensitive
 * per the spec. In practice, however, it seems safe to treat emails as
 * case-insensitive to allow for users who might vary the usage of
 * upper/lower case. See more discussion here: https://ux.stackexchange.com/a/16849
 */
export function normalizeEmailAddress(input: string): string {
    return isEmailAddressLike(input) ? input.trim().toLowerCase() : input.trim();
}

/**
 * This is a "good enough" check for whether the input is an email address.
 * From https://stackoverflow.com/a/32686261
 * It is used to determine whether to apply normalization (lower-casing)
 * when comparing identifiers in user lookups. This allows case-sensitive
 * identifiers for other authentication methods.
 */
export function isEmailAddressLike(input: string): boolean {
    if (input.length > 1000) {
        // This limit is in place to prevent abuse via a polynomial-time regex attack
        throw new Error('Input too long');
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

/**
 * Normalizes a string to replace non-alphanumeric and diacritical marks with
 * plain equivalents.
 * Based on https://stackoverflow.com/a/37511463/772859
 */
export function normalizeString(input: string, spaceReplacer = ' '): string {
    return (input || '')
        .normalize('NFD')
        .replace(/[\u00df]/g, 'ss')
        .replace(/[\u1e9e]/g, 'SS')
        .replace(/[\u0308]/g, 'e')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[!"£$%^&*()+[\]{};:@#~?\\/,|><`¬'=‘’©®™]/g, '')
        .replace(/\s+/g, spaceReplacer);
}

/**
 * Predicate with type guard, used to filter out null or undefined values
 * in a filter operation.
 */
export function notNullOrUndefined<T>(val: T | undefined | null): val is T {
    return val !== undefined && val !== null;
}

/**
 * Takes a predicate function and returns a negated version.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function not(predicate: (...args: any[]) => boolean) {
    return (...args: any[]) => !predicate(...args);
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

declare const File: any;

/**
 * Type-safe omit function - returns a new object which omits the specified keys.
 */
export function omit<T extends object, K extends keyof T>(obj: T, keysToOmit: K[]): Omit<T, K>;
export function omit<T extends object | any[]>(obj: T, keysToOmit: string[], recursive: boolean): T;
export function omit<T, K extends keyof T>(obj: T, keysToOmit: string[], recursive: boolean = false): T {
    if ((recursive && !isObject(obj)) || isFileObject(obj)) {
        return obj;
    }

    if (recursive && Array.isArray(obj)) {
        return obj.map((item: any) => omit(item, keysToOmit, true)) as T;
    }

    return Object.keys(obj as object).reduce(
        (output: any, key) => {
            if (keysToOmit.includes(key)) {
                return output;
            }
            if (recursive) {
                return { ...output, [key]: omit((obj as any)[key], keysToOmit, true) };
            }
            return { ...output, [key]: (obj as any)[key] };
        },
        {} as Omit<T, K>,
    );
}

/**
 * When running in the Node environment, there is no native File object.
 */
function isFileObject(input: any): boolean {
    if (typeof File === 'undefined') {
        return false;
    } else {
        return input instanceof File;
    }
}

/**
 * Returns a new object which is a subset of the input, including only the specified properties.
 * Can be called with a single argument (array of props to pick), in which case it returns a partially
 * applied pick function.
 */

export function pick<T extends string>(props: T[]): <U>(input: U) => Pick<U, Extract<keyof U, T>>;
export function pick<U, T extends keyof U>(input: U, props: T[]): { [K in T]: U[K] };
export function pick<U, T extends keyof U>(
    inputOrProps: U | T[],
    maybeProps?: T[],
): { [K in T]: U[K] } | ((input: U) => Pick<U, Extract<keyof U, T>>) {
    if (Array.isArray(inputOrProps)) {
        return (input: U) => _pick(input, inputOrProps);
    } else {
        return _pick(inputOrProps, maybeProps || []);
    }
}

function _pick<U, T extends keyof U>(input: U, props: T[]): { [K in T]: U[K] } {
    const output: any = {};
    for (const prop of props) {
        output[prop] = input[prop];
    }
    return output;
}

export function random(): number {
    const buffer = new ArrayBuffer(8);
    const bytes = crypto.getRandomValues(new Uint8Array(buffer));

    // sets the exponent value (11 bits) to 01111111111 (1023)
    // since the bias is 1023 (2 * (11 - 1) - 1), 1023 - 1023 = 0
    // 2^0 * (1 + [52 bit number between 0-1]) = number between 1-2
    bytes[0] = 63;
    bytes[1] = bytes[1]! | 240;

    return new DataView(buffer).getFloat64(0) - 1;
}

export function generateRandomInteger(max: number): number {
    if (max < 0 || !Number.isInteger(max)) {
        throw new Error("Argument 'max' must be an integer greater than or equal to 0");
    }
    const bitLength = (max - 1).toString(2).length;
    const shift = bitLength % 8;
    const bytes = new Uint8Array(Math.ceil(bitLength / 8));

    crypto.getRandomValues(bytes);

    // This zeroes bits that can be ignored to increase the chance `result` < `max`.
    // For example, if `max` can be represented with 10 bits, the leading 6 bits of the random 16 bits (2 bytes) can be ignored.
    if (shift !== 0) {
        bytes[0] &= (1 << shift) - 1;
    }
    let result = bytesToInteger(bytes);
    while (result >= max) {
        crypto.getRandomValues(bytes);
        if (shift !== 0) {
            bytes[0] &= (1 << shift) - 1;
        }
        result = bytesToInteger(bytes);
    }
    return result;
}

export function generateRandomString(length: number, alphabet: string): string {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += alphabet[generateRandomInteger(alphabet.length)];
    }
    return result;
}

type AlphabetPattern = 'a-z' | 'A-Z' | '0-9' | '-' | '_';

export function alphabet(...patterns: AlphabetPattern[]): string {
    const patternSet = new Set<AlphabetPattern>(patterns);
    let result = '';
    for (const pattern of patternSet) {
        if (pattern === 'a-z') {
            result += 'abcdefghijklmnopqrstuvwxyz';
        } else if (pattern === 'A-Z') {
            result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        } else if (pattern === '0-9') {
            result += '0123456789';
        } else {
            result += pattern;
        }
    }
    return result;
}

/**
 * @description
 * Returns an array with only unique values. Objects are compared by reference,
 * unless the `byKey` argument is supplied, in which case matching properties will
 * be used to check duplicates
 */
export function unique<T>(arr: T[], byKey?: keyof T): T[] {
    if (byKey == null) {
        return Array.from(new Set(arr));
    } else {
        // Based on https://stackoverflow.com/a/58429784/772859
        return [...new Map(arr.map((item) => [item[byKey], item])).values()];
    }
}
