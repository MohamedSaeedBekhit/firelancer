import { DeepPartial, LanguageCode } from '@firelancer/common';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Translation } from '../../common';
import { FirelancerEntity } from '../base/base.entity';
import { Facet } from './facet.entity';

@Entity()
export class FacetTranslation extends FirelancerEntity implements Translation<Facet> {
    constructor(input?: DeepPartial<Translation<FacetTranslation>>) {
        super(input);
    }

    @Column('varchar')
    languageCode: LanguageCode;

    @Column()
    name: string;

    @Index()
    @ManyToOne(() => Facet, (base) => base.translations, { onDelete: 'CASCADE' })
    base: Facet;
}
