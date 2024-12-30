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
