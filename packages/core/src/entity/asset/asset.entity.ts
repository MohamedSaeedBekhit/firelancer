import { AssetType } from '../../common/shared-schema';
import { Column, DeepPartial, Entity, OneToMany } from 'typeorm';
import { FirelancerEntity } from '../base/base.entity';
import { Collection } from '../collection/collection.entity';

/**
 * @description
 * An Asset represents a file such as an image which can be associated with certain other entities
 * such as Posts.
 */
@Entity()
export class Asset extends FirelancerEntity {
    constructor(input?: DeepPartial<Asset>) {
        super(input);
    }

    @Column()
    name: string;

    @Column('varchar')
    type: AssetType;

    @Column()
    mimeType: string;

    @Column({ default: 0 })
    width: number;

    @Column({ default: 0 })
    height: number;

    @Column()
    fileSize: number;

    @Column()
    source: string;

    @Column()
    preview: string;

    @Column('simple-json', { nullable: true })
    focalPoint: { x: number; y: number } | null;

    @OneToMany(() => Collection, (collection) => collection.featuredAsset)
    featuredInCollections?: Collection[];
}
