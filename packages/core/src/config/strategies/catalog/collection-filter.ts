import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import {
    ConfigArgs,
    ConfigArgValues,
    ConfigurableOperationDef,
    ConfigurableOperationDefOptions,
} from '../../../common/configurable-operation';
import { ConfigArg } from '../../../common/shared-schema';
import { CollectableEntity } from '../../../entity';

type Entity = CollectableEntity['entityType'];

export type ApplyCollectionFilterFn<T extends ConfigArgs> = (
    qb: SelectQueryBuilder<ObjectLiteral>,
    args: ConfigArgValues<T>,
) => SelectQueryBuilder<ObjectLiteral>;

export interface CollectionFilterConfig<T extends ConfigArgs> extends ConfigurableOperationDefOptions<T> {
    entityType: Entity;
    apply: ApplyCollectionFilterFn<T>;
}
/**
 * @description
 * A CollectionFilter defines a rule which can be used to associate Entities (i.e JobPosts) with a Collection.
 * The filtering is done by defining the `apply()` function, which receives a TypeORM
 * [`QueryBuilder`](https://typeorm.io/#/select-query-builder) object to which clauses may be added.
 */
export class CollectionFilter<T extends ConfigArgs = ConfigArgs> extends ConfigurableOperationDef<T> {
    public readonly entityType: Entity;
    private readonly applyFn: ApplyCollectionFilterFn<T>;

    constructor(config: CollectionFilterConfig<T>) {
        super(config);
        this.entityType = config.entityType;
        this.applyFn = config.apply;
    }

    apply(qb: SelectQueryBuilder<ObjectLiteral>, args: ConfigArg[]): SelectQueryBuilder<ObjectLiteral> {
        return this.applyFn(qb, this.argsArrayToHash(args));
    }
}
