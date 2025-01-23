import { ID } from '@firelancer/common';
import { Column, DeepPartial, Entity, Index, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { FirelancerEntity } from '../base/base.entity';
import { EntityId } from '../entity-id.decorator';
import { Facet } from '../facet/facet.entity';
import { JobPost } from '../job-post/job-post.entity';
import { LocaleString, Translation } from '../../common';
import { FacetValueTranslation } from './facet-value-translation.entity';

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

    name: LocaleString;

    @OneToMany(() => FacetValueTranslation, (translation) => translation.base, { eager: true })
    translations: Array<Translation<FacetValue>>;

    @EntityId()
    facetId: ID;

    @Index()
    @ManyToOne(() => Facet, (group) => group.values, { onDelete: 'CASCADE' })
    facet: Facet;

    @ManyToMany(() => JobPost, (jobPost) => jobPost.facetValues)
    jobPosts: JobPost[];
}
