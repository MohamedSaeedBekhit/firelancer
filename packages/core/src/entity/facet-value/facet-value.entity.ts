import { Column, DeepPartial, Entity, Index, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { ID } from '../../common';
import { FirelancerEntity } from '../base/base.entity';
import { Facet } from '../facet/facet.entity';
import { JobPost } from '../job-post/job-post.entity';

/**
 * @description
 * A particular value of a Facet.
 */
@Entity()
export class FacetValue extends FirelancerEntity {
    constructor(input?: DeepPartial<FacetValue>) {
        super(input);
    }

    @Column({ type: 'varchar' })
    code: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column()
    facetId: ID;

    @Index()
    @ManyToOne(() => Facet, (group) => group.values, { onDelete: 'CASCADE' })
    facet: Facet;

    @ManyToMany(() => JobPost, (jobPost) => jobPost.facetValues)
    @JoinTable()
    jobPosts: JobPost[];
}
