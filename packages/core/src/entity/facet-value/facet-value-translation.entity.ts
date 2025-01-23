import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { FirelancerEntity } from '../base/base.entity';
import { FacetValue } from './facet-value.entity';
import { Translation } from '../../common';
import { DeepPartial, LanguageCode } from '@firelancer/common';

@Entity()
export class FacetValueTranslation extends FirelancerEntity implements Translation<FacetValue> {
    constructor(input?: DeepPartial<Translation<FacetValue>>) {
        super(input);
    }

    @Column('varchar')
    languageCode: LanguageCode;

    @Column()
    name: string;

    @Index()
    @ManyToOne(() => FacetValue, (base) => base.translations, { onDelete: 'CASCADE' })
    base: FacetValue;
}
