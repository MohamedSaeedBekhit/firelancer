import { SelectQueryBuilder } from 'typeorm';
import { ConfigArg } from '../../../api';
import {
  ConfigArgs,
  ConfigArgValues,
  ConfigurableOperationDef,
  ConfigurableOperationDefOptions,
} from '../../../common/configurable-operation';
import { JobPost } from '../../../entity';

export type ApplyCollectionFilterFn<T extends ConfigArgs> = (
  qb: SelectQueryBuilder<JobPost>,
  args: ConfigArgValues<T>,
) => SelectQueryBuilder<JobPost>;

export interface CollectionFilterConfig<T extends ConfigArgs> extends ConfigurableOperationDefOptions<T> {
  apply: ApplyCollectionFilterFn<T>;
}
/* eslint-disable max-len */
/**
 * @description
 * A CollectionFilter defines a rule which can be used to associate JobPosts with a Collection.
 * The filtering is done by defining the `apply()` function, which receives a TypeORM
 * [`QueryBuilder`](https://typeorm.io/#/select-query-builder) object to which clauses may be added.
 *
 * Here's a simple example of a custom CollectionFilter:
 *
 * @example
 * ```ts
 * import { CollectionFilter } from '\@firelancer/core';
 *
 * export const skuCollectionFilter = new CollectionFilter({
 *   args: {
 *     // The `args` object defines the user-configurable arguments
 *     // which will get passed to the filter's `apply()` function.
 *     sku: {
 *       type: 'string',
 *       label: 'SKU',
 *       description: 'Matches any product variants with SKUs containing this value',
 *     },
 *   },
 *   code: 'variant-sku-filter',
 *   description: 'Filter by matching SKU',
 *
 *   // This is the function that defines the logic of the filter.
 *   apply: (qb, args) => {
 *     const LIKE = qb.connection.options.type === 'postgres' ? 'ILIKE' : 'LIKE';
 *     return qb.andWhere(`productVariant.sku ${LIKE} :sku`, { sku: `%${args.sku}%` });
 *   },
 * });
 * ```
 */
export class CollectionFilter<T extends ConfigArgs = ConfigArgs> extends ConfigurableOperationDef<T> {
  /* eslint-enable max-len */
  private readonly applyFn: ApplyCollectionFilterFn<T>;
  constructor(config: CollectionFilterConfig<T>) {
    super(config);
    this.applyFn = config.apply;
  }

  apply(qb: SelectQueryBuilder<JobPost>, args: ConfigArg[]): SelectQueryBuilder<JobPost> {
    return this.applyFn(qb, this.argsArrayToHash(args));
  }
}
