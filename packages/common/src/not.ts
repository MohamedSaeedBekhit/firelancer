/**
 * Takes a predicate function and returns a negated version.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function not(predicate: (...args: any[]) => boolean) {
    return (...args: any[]) => !predicate(...args);
}
