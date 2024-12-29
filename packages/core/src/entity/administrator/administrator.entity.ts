import { Column, DeepPartial, DeleteDateColumn, Entity, JoinColumn, OneToOne } from 'typeorm';
import { SoftDeletable } from '../../common/shared-types';
import { FirelancerEntity } from '../base/base.entity';
import { User } from '../user/user.entity';

/**
 * @description
 * An administrative user who has access to the Admin UI and Admin API. The
 * specific permissions of the Administrator are determined by the assigned Role
 */
@Entity()
export class Administrator extends FirelancerEntity implements SoftDeletable {
    constructor(input?: DeepPartial<Administrator>) {
        super(input);
    }

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date | null;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    emailAddress: string;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;
}
