import { ObjectLiteral, ObjectType, SelectQueryBuilder } from 'typeorm';
import { ConfigArg } from '../../../api';
import {
    ConfigArgs,
    ConfigArgValues,
    ConfigurableOperationDef,
    ConfigurableOperationDefOptions,
} from '../../../common/configurable-operation';

export type ApplyCollectionFilterFn<T extends ConfigArgs, Entity extends ObjectLiteral = ObjectLiteral> = (
    qb: SelectQueryBuilder<ObjectType<Entity>>,
    args: ConfigArgValues<T>,
) => SelectQueryBuilder<ObjectType<Entity>>;

export interface CollectionFilterConfig<T extends ConfigArgs, Entity extends ObjectLiteral = ObjectLiteral>
    extends ConfigurableOperationDefOptions<T> {
    apply: ApplyCollectionFilterFn<T, Entity>;
}
/**
 * @description
 * A CollectionFilter defines a rule which can be used to associate Entities (i.e JobPosts) with a Collection.
 * The filtering is done by defining the `apply()` function, which receives a TypeORM
 * [`QueryBuilder`](https://typeorm.io/#/select-query-builder) object to which clauses may be added.
 */
export class CollectionFilter<
    T extends ConfigArgs = ConfigArgs,
    Entity extends ObjectLiteral = ObjectLiteral,
> extends ConfigurableOperationDef<T> {
    public readonly entityType: ObjectType<Entity>;
    private readonly applyFn: ApplyCollectionFilterFn<T, Entity>;

    constructor(config: CollectionFilterConfig<T, Entity> & { entityType: ObjectType<Entity> }) {
        super(config);
        this.entityType = config.entityType;
        this.applyFn = config.apply;
    }

    apply(qb: SelectQueryBuilder<ObjectType<Entity>>, args: ConfigArg[]): SelectQueryBuilder<ObjectType<Entity>> {
        return this.applyFn(qb, this.argsArrayToHash(args));
    }
}
