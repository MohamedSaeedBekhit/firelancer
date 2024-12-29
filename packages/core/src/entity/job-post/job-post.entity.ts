import { Column, DeepPartial, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Draftable, ID, SoftDeletable } from '../../common';
import { FirelancerEntity } from '../base/base.entity';
import { Collection } from '../collection/collection.entity';
import { Customer } from '../customer/customer.entity';
import { FacetValue } from '../facet-value/facet-value.entity';
import { JobPostAsset } from './job-post-asset.entity';

/**
 * @description
 * Job Post
 */
@Entity()
export class JobPost extends FirelancerEntity implements SoftDeletable, Draftable {
    constructor(input?: DeepPartial<JobPost>) {
        super(input);
    }

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date | null;

    @Column({ type: Date, nullable: true })
    publishedAt: Date | null;

    @Column()
    customerId: ID;

    @ManyToOne(() => Customer, (customer) => customer.jobPosts)
    customer: Customer;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    enabled: boolean;

    @Column()
    private: boolean;

    @OneToMany(() => JobPostAsset, (jobPostAsset) => jobPostAsset.jobPost)
    assets: JobPostAsset[];

    @ManyToMany(() => FacetValue, (facetValue) => facetValue.jobPosts)
    @JoinTable()
    facetValues: FacetValue[];

    @ManyToMany(() => Collection, (collection) => collection.jobPosts)
    collections: Collection[];
}
