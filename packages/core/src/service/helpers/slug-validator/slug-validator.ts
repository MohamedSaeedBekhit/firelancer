import { Injectable, Type } from '@nestjs/common';

import { RequestContext } from '../../../common';
import { TransactionalConnection } from '../../../connection/';
import { FirelancerEntity } from '../../../entity';
import { ID, LanguageCode, normalizeString } from '@firelancer/common';

export type InputWithSlug = {
    id?: ID | null;
    translations?: Array<{
        id?: ID | null;
        languageCode: LanguageCode;
        slug?: string | null;
    }> | null;
};

export type TranslationEntity = FirelancerEntity & {
    id: ID;
    languageCode: LanguageCode;
    slug: string;
    base: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/**
 * @description
 * Used to validate slugs to ensure they are URL-safe and unique. Designed to be used with translatable
 * entities such as {@link Collection}.
 */
@Injectable()
export class SlugValidator {
    constructor(private connection: TransactionalConnection) {}

    /**
     * Normalizes the slug to be URL-safe, and ensures it is unique for the given languageCode.
     * Mutates the input.
     */
    async validateSlugs<T extends InputWithSlug, E extends TranslationEntity>(
        ctx: RequestContext,
        input: T,
        translationEntity: Type<E>,
    ): Promise<T> {
        if (input.translations) {
            for (const t of input.translations) {
                if (t.slug) {
                    t.slug = normalizeString(t.slug, '-');
                    let match: E | null;
                    let suffix = 1;
                    const seen: ID[] = [];
                    const alreadySuffixed = /-\d+$/;
                    do {
                        const qb = this.connection
                            .getRepository(ctx, translationEntity)
                            .createQueryBuilder('translation')
                            .innerJoinAndSelect('translation.base', 'base')
                            .andWhere('translation.slug = :slug', { slug: t.slug })
                            .andWhere('translation.languageCode = :languageCode', {
                                languageCode: t.languageCode,
                            });
                        if (input.id) {
                            qb.andWhere('translation.base != :id', { id: input.id });
                        }
                        if (seen.length) {
                            qb.andWhere('translation.id NOT IN (:...seen)', { seen });
                        }
                        match = await qb.getOne();
                        if (match) {
                            if (!match.base.deletedAt) {
                                suffix++;
                                if (alreadySuffixed.test(t.slug)) {
                                    t.slug = t.slug.replace(alreadySuffixed, `-${suffix}`);
                                } else {
                                    t.slug = `${t.slug}-${suffix}`;
                                }
                            } else {
                                seen.push(match.id);
                            }
                        }
                    } while (match);
                }
            }
        }
        return input;
    }
}
