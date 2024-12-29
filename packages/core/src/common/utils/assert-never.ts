/**
 * Used in exhaustiveness checks to assert a codepath should never be reached.
 */
export function assertNever(value: never): never {
    throw new Error(`Expected never, got ${typeof value} (${JSON.stringify(value)})`);
}
