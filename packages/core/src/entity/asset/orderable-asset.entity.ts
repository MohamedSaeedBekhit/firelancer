import { ID } from '../../common/shared-schema';
import { Column, DeepPartial, Index, ManyToOne } from 'typeorm';
import { Orderable } from '../../common';
import { Asset } from '../asset/asset.entity';
import { FirelancerEntity } from '../base/base.entity';
import { EntityId } from '../entity-id.decorator';

/**
 * @description
 * This base class is extended in order to enable specific ordering of the one-to-many
 * Entity -> Assets relation. Using a many-to-many relation does not provide a way
 * to guarantee order of the Assets, so this entity is used in place of the
 * usual join table that would be created by TypeORM.
 * See https://typeorm.io/#/many-to-many-relations/many-to-many-relations-with-custom-properties
 */
export abstract class OrderableAsset extends FirelancerEntity implements Orderable {
    protected constructor(input?: DeepPartial<OrderableAsset>) {
        super(input);
    }

    @EntityId()
    assetId: ID;

    @Index()
    @ManyToOne(() => Asset, { eager: true, onDelete: 'CASCADE' })
    asset: Asset;

    @Column()
    position: number;
}
