import { Type, unique } from '@firelancer/common';
import { OrderByCondition } from 'typeorm';
import { DataSource } from 'typeorm/data-source/DataSource';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { NullOptionals, SortParameter } from '../../../common';
import { UserInputError } from '../../../common/error/errors';
import { FirelancerEntity } from '../../../entity';
import { escapeCalculatedColumnExpression, getColumnMetadata } from './connection-utils';
import { getCalculatedColumns } from './get-calculated-columns';

/**
 * Parses the provided SortParameter array against the metadata of the given entity, ensuring that only
 * valid fields are being sorted against. The output assumes
 * @param connection
 * @param entity
 * @param sortParams
 * @param customPropertyMap
 * @param entityAlias
 * @param customFields
 */
export function parseSortParams<T extends FirelancerEntity>(
    connection: DataSource,
    entity: Type<T>,
    sortParams?: NullOptionals<SortParameter<T>> | null,
    customPropertyMap?: { [name: string]: string },
    entityAlias?: string,
): OrderByCondition {
    if (!sortParams || Object.keys(sortParams).length === 0) {
        return {};
    }
    const { columns, alias: defaultAlias } = getColumnMetadata(connection, entity);
    const alias = entityAlias ?? defaultAlias;
    const calculatedColumns = getCalculatedColumns(entity);
    const output: OrderByCondition = {};
    for (const [key, order] of Object.entries(sortParams)) {
        const calculatedColumnDef = calculatedColumns.find((c) => c.name === key);
        const matchingColumn = columns.find((c) => c.propertyName === key);
        if (matchingColumn) {
            output[`${alias}.${matchingColumn.propertyPath}`] = order as any;
        } else if (calculatedColumnDef) {
            const instruction = calculatedColumnDef.listQuery;
            if (instruction && instruction.expression) {
                output[escapeCalculatedColumnExpression(connection, instruction.expression)] = order as any;
            }
        } else if (customPropertyMap?.[key]) {
            output[customPropertyMap[key]] = order as any;
        } else {
            throw new UserInputError('error.invalid-sort-field');
        }
    }
    return output;
}
