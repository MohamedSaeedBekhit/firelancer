import { Column, Entity, Index, ManyToOne, TableInheritance } from 'typeorm';
import { HistoryEntryType } from '../../common/shared-schema';
import { Administrator } from '../administrator/administrator.entity';
import { FirelancerEntity } from '../base/base.entity';

/**
 * @description
 * An abstract entity representing an entry in the history of an Order (OrderHistoryEntry) or a Customer (CustomerHistoryEntry).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'discriminator' } })
export abstract class HistoryEntry extends FirelancerEntity {
    @Index()
    @ManyToOne(() => Administrator)
    administrator?: Administrator;

    @Column({ nullable: false, type: 'varchar' })
    readonly type: HistoryEntryType;

    @Column()
    isPublic: boolean;

    @Column('simple-json')
    data: any;
}
