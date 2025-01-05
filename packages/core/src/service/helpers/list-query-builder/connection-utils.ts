import { Type } from '@firelancer/common';
import { DataSource } from 'typeorm';

/**
 * @description
 * Returns TypeORM ColumnMetadata for the given entity type.
 */
export function getColumnMetadata<T>(connection: DataSource, entity: Type<T>) {
    const metadata = connection.getMetadata(entity);
    const columns = metadata.columns;
    const alias = metadata.name.toLowerCase();
    return { columns, alias };
}

export function getEntityAlias<T>(connection: DataSource, entity: Type<T>): string {
    return connection.getMetadata(entity).name.toLowerCase();
}

/**
 * @description
 * Escapes identifiers in an expression according to the current database driver.
 */
export function escapeCalculatedColumnExpression(connection: DataSource, expression: string): string {
    return expression.replace(/\b([a-z]+[A-Z]\w+)\b/g, (substring) => connection.driver.escape(substring));
}
