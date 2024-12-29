import { ID } from '../shared-types';

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
