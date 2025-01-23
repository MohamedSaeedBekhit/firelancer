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
    const { columns, translationColumns, alias: defaultAlias } = getColumnMetadata(connection, entity);
    const alias = entityAlias ?? defaultAlias;
    const calculatedColumns = getCalculatedColumns(entity);
    const output: OrderByCondition = {};
    for (const [key, order] of Object.entries(sortParams)) {
        const calculatedColumnDef = calculatedColumns.find((c) => c.name === key);
        const matchingColumn = columns.find((c) => c.propertyName === key);
        if (matchingColumn) {
            output[`${alias}.${matchingColumn.propertyPath}`] = order as 'ASC' | 'DESC';
        } else if (translationColumns.find((c) => c.propertyName === key)) {
            const translationsAlias = connection.namingStrategy.joinTableName(alias, 'translations', '', '');
            const pathParts = [translationsAlias];
            pathParts.push(key);
            output[pathParts.join('.')] = order as 'ASC' | 'DESC';
        } else if (calculatedColumnDef) {
            const instruction = calculatedColumnDef.listQuery;
            if (instruction && instruction.expression) {
                output[escapeCalculatedColumnExpression(connection, instruction.expression)] = order as 'ASC' | 'DESC';
            }
        } else if (customPropertyMap?.[key]) {
            output[customPropertyMap[key]] = order as 'ASC' | 'DESC';
        } else {
            throw new UserInputError('error.invalid-sort-field', {
                fieldName: key,
                validFields: [
                    ...getValidSortFields([...columns, ...translationColumns]),
                    ...calculatedColumns.map((c) => c.name.toString()),
                ].join(', '),
            });
        }
    }
    return output;
}

function getValidSortFields(columns: ColumnMetadata[]): string[] {
    return unique(columns.map((c) => c.propertyName));
}
