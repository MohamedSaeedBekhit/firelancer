import { ID } from '@firelancer/common';
import { Column, DeepPartial, Entity, Index, ManyToMany, ManyToOne } from 'typeorm';
import { FirelancerEntity } from '../base/base.entity';
import { EntityId } from '../entity-id.decorator';
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

    @EntityId()
    facetId: ID;

    @Index()
    @ManyToOne(() => Facet, (group) => group.values, { onDelete: 'CASCADE' })
    facet: Facet;

    @ManyToMany(() => JobPost, (jobPost) => jobPost.facetValues)
    jobPosts: JobPost[];
}
