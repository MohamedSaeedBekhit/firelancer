import { ColumnOptions } from 'typeorm';
import { MoneyStrategy } from '../money-strategy';

/**
 * @description
 * A MoneyStrategy that stores monetary values as a `int` type in the database.
 */
export class DefaultMoneyStrategy implements MoneyStrategy {
    readonly moneyColumnOptions: ColumnOptions = {
        type: 'int',
    };
    readonly precision: number = 2;

    round(value: number, quantity = 1): number {
        return Math.round(value) * quantity;
    }
}
