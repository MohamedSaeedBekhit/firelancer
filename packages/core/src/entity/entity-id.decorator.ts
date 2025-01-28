import { Type } from '@firelancer/common/lib/shared-types';
import { FirelancerEntity } from './base/base.entity';

interface IdColumnOptions {
    /** Whether the field is nullable. Defaults to false */
    nullable?: boolean;
    /** Whether this is a primary key. Defaults to false */
    primary?: boolean;
}

interface IdColumnConfig {
    name: string;
    entity: unknown;
    options?: IdColumnOptions;
}

const idColumnRegistry = new Map<unknown, IdColumnConfig[]>();
let primaryGeneratedColumn: { entity: unknown; name: string } | undefined;

/**
 * Decorates a property which should be marked as a generated primary key.
 * Designed to be applied to the FirelancerEntity id property.
 */
export function PrimaryGeneratedId() {
    return (entity: unknown, propertyName: string) => {
        primaryGeneratedColumn = {
            entity,
            name: propertyName,
        };
    };
}

/**
 * @description
 * Decorates a property which points to another entity by ID. This custom decorator is needed
 * because we do not know the data type of the ID column until runtime, when we have access
 * to the configured EntityIdStrategy.
 */
export function EntityId(options?: IdColumnOptions) {
    return (entity: unknown, propertyName: string) => {
        const idColumns = idColumnRegistry.get(entity);
        const entry = { name: propertyName, entity, options };
        if (idColumns) {
            idColumns.push(entry);
        } else {
            idColumnRegistry.set(entity, [entry]);
        }
    };
}

/**
 * Returns any columns on the entity which have been decorated with the EntityId
 * decorator.
 */
export function getIdColumnsFor(entityType: Type<unknown>): IdColumnConfig[] {
    const match = Array.from(idColumnRegistry.entries()).find(
        ([entity]) => entity instanceof FirelancerEntity && entity.constructor === entityType,
    );
    return match ? match[1] : [];
}

/**
 * Returns the entity and property name that was decorated with the EntityId decorator.
 */
export function getPrimaryGeneratedIdColumn(): { entity: unknown; name: string } {
    if (!primaryGeneratedColumn) {
        throw new Error(
            'primaryGeneratedColumn is undefined. The base FirelancerEntity must have the @PrimaryGeneratedId() decorator set on its id property.',
        );
    }
    return primaryGeneratedColumn;
}
