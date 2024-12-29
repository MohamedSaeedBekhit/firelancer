import { EntityIdStrategy } from '../entity-id-strategy';

/**
 * @description
 * An id strategy which uses string uuids as primary keys
 * for all entities. This strategy can be configured with the `entityIdStrategy`
 * property of the `entityOptions` property of FirelancerConfig.
 *
 * @example
 * ```ts
 * import { UuidIdStrategy, FirelancerConfig } from '\@firelancer/core';
 *
 * export const config: FirelancerConfig = {
 *   entityOptions: {
 *     entityIdStrategy: new UuidIdStrategy(),
 *     // ...
 *   }
 * }
 * ```
 */
export class UuidIdStrategy implements EntityIdStrategy<'uuid'> {
    readonly primaryKeyType = 'uuid';
    decodeId(id: string): string {
        return id;
    }
    encodeId(primaryKey: string): string {
        return primaryKey;
    }
}
