import { Column, DeepPartial, Entity, Index, ManyToOne } from 'typeorm';
import { Collection } from './collection.entity';
import { FirelancerEntity } from '../base/base.entity';
import { Translation } from '../../common';
import { LanguageCode } from '@firelancer/common';

@Entity()
export class CollectionTranslation extends FirelancerEntity implements Translation<Collection> {
    constructor(input?: DeepPartial<Translation<Collection>>) {
        super(input);
    }

    @Column('varchar')
    languageCode: LanguageCode;

    @Column()
    name: string;

    @Index({ unique: false })
    @Column()
    slug: string;

    @Column('text')
    description: string;

    @Index()
    @ManyToOne(() => Collection, (base) => base.translations, { onDelete: 'CASCADE' })
    base: Collection;
}
