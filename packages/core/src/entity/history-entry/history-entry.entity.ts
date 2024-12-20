import { Column, Entity, Index, ManyToOne, TableInheritance } from 'typeorm';
import { HistoryEntryType } from '../../common/shared-types';
import { Administrator } from '../administrator/administrator.entity';
import { FirelancerEntity } from '../base/base.entity';

/**
 * @description
 * An abstract entity representing an entry in the history of an Order (OrderHistoryEntry) or a Customer (CustomerHistoryEntry).
 */
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
}
