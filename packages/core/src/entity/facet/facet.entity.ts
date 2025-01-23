import { Column, DeepPartial, Entity, OneToMany } from 'typeorm';
import { LocaleString, Translation } from '../../common';
import { FirelancerEntity } from '../base/base.entity';
import { FacetValue } from '../facet-value/facet-value.entity';
import { FacetTranslation } from './facet-translation.entity';

/**
 * @description
 * A Facet is a class of properties which can be applied to a JobPost.
 * They are used to enable [faceted search](https://en.wikipedia.org/wiki/Faceted_search) whereby entities
 * can be filtered along a number of dimensions (facets).
 *
 * For example, there could be a Facet named "Skill" which has a number of FacetValues representing
 * the various skills, e.g. "Web Development", "Accounting", etc.
 */
@Entity()
export class Facet extends FirelancerEntity {
    constructor(input?: DeepPartial<Facet>) {
        super(input);
    }

    @Column({ type: 'varchar', unique: true })
    code: string;

    name: LocaleString;

    @OneToMany(() => FacetTranslation, (translation) => translation.base, { eager: true })
    translations: Array<Translation<Facet>>;

    @OneToMany(() => FacetValue, (value) => value.facet)
    values: FacetValue[];
}
