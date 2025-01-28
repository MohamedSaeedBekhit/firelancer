import { Type } from '@firelancer/common/lib/shared-types';
import { CalculatedColumnDefinition, CALCULATED_PROPERTIES } from '../../../common/calculated-decorator';

/**
 * @description
 * Returns calculated columns definitions for the given entity type.
 */
export function getCalculatedColumns<T>(entity: Type<T>) {
    const calculatedColumns: CalculatedColumnDefinition[] = [];
    const prototype = entity.prototype;
    if (Object.prototype.hasOwnProperty.call(prototype, CALCULATED_PROPERTIES)) {
        for (const property of prototype[CALCULATED_PROPERTIES]) {
            calculatedColumns.push(property);
        }
    }
    return calculatedColumns;
}
