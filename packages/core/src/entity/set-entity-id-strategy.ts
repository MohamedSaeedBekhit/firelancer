import { Type } from '@firelancer/common';
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { EntityIdStrategy } from '../config';
import { getIdColumnsFor, getPrimaryGeneratedIdColumn } from './entity-id.decorator';

export function setEntityIdStrategy(
    entityIdStrategy: EntityIdStrategy<'uuid' | 'increment'>,
    entities: Array<Type<unknown>>,
) {
    setBaseEntityIdType(entityIdStrategy);
    setEntityIdColumnTypes(entityIdStrategy, entities);
}

function setEntityIdColumnTypes(
    entityIdStrategy: EntityIdStrategy<'uuid' | 'increment'>,
    entities: Array<Type<unknown>>,
) {
    const columnDataType = entityIdStrategy.primaryKeyType === 'increment' ? 'int' : 'varchar';
    for (const EntityCtor of entities) {
        const columnConfig = getIdColumnsFor(EntityCtor);
        for (const { name, options, entity } of columnConfig) {
            Column({
                type: columnDataType,
                nullable: (options && options.nullable) || false,
                primary: (options && options.primary) || false,
            })(entity as object, name);
        }
    }
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function setBaseEntityIdType(entityIdStrategy: EntityIdStrategy<any>) {
    const { entity, name } = getPrimaryGeneratedIdColumn();
    PrimaryGeneratedColumn(entityIdStrategy.primaryKeyType)(entity as object, name);
}
