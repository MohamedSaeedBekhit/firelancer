/**
 * Takes a predicate function and returns a negated version.
 */
export function not(predicate: (...args: any[]) => boolean) {
    return (...args: any[]) => !predicate(...args);
}
