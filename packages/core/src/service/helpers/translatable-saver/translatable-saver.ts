import { Type } from '@firelancer/common/lib/shared-types';
import { omit } from '@firelancer/common/lib/shared-utils';
import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { RequestContext, Translatable, TranslatedInput, Translation } from '../../../common';
import { ID } from '../../../common/shared-schema';
import { TransactionalConnection } from '../../../connection';
import { FirelancerEntity } from '../../../entity';
import { InputPatch, patchEntity } from '../utils/patch-entity';
import { TranslationDiffer } from './translation-differ';

export interface CreateTranslatableOptions<T extends Translatable> {
    ctx: RequestContext;
    entityType: Type<T>;
    translationType: Type<Translation<T>>;
    input: TranslatedInput<T>;
    beforeSave?: (newEntity: T) => unknown | Promise<unknown>;
    typeOrmSubscriberData?: unknown;
}

export interface UpdateTranslatableOptions<T extends Translatable> extends CreateTranslatableOptions<T> {
    input: TranslatedInput<T> & { id: ID };
}

/**
 * @description
 * A helper which contains methods for creating and updating entities which implement the {@link Translatable} interface.
 *
 * @example
 * ```ts
 * export class MyService {
 *   constructor(private translatableSaver: TranslatableSaver) {}
 *
 *   async create(ctx: RequestContext, input: CreateFacetInput): Promise<Translated<Facet>> {
 *     const facet = await this.translatableSaver.create({
 *       ctx,
 *       input,
 *       entityType: Facet,
 *       translationType: FacetTranslation,
 *       beforeSave: async f => {
 *           f.code = await this.ensureUniqueCode(ctx, f.code);
 *       },
 *     });
 *     return facet;
 *   }
 *
 *   // ...
 * }
 * ```
 */
@Injectable()
export class TranslatableSaver {
    constructor(private connection: TransactionalConnection) {}

    /**
     * @description
     * Create a translatable entity, including creating any translation entities according
     * to the `translations` array.
     */
    async create<T extends Translatable & FirelancerEntity>(options: CreateTranslatableOptions<T>): Promise<T> {
        const { ctx, entityType, translationType, input, beforeSave, typeOrmSubscriberData } = options;

        const entity = new entityType(input);
        const translations: Array<Translation<T>> = [];

        if (input.translations) {
            for (const translationInput of input.translations) {
                const translation = new translationType(translationInput);
                translations.push(translation);
                await this.connection.getRepository(ctx, translationType).save(translation);
            }
        }

        entity.translations = translations;
        if (typeof beforeSave === 'function') {
            await beforeSave(entity);
        }
        return await this.connection.getRepository(ctx, entityType).save(entity, { data: typeOrmSubscriberData });
    }

    /**
     * @description
     * Update a translatable entity. Performs a diff of the `translations` array in order to
     * perform the correct operation on the translations.
     */
    async update<T extends Translatable & FirelancerEntity>(options: UpdateTranslatableOptions<T>): Promise<T> {
        const { ctx, entityType, translationType, input, beforeSave, typeOrmSubscriberData } = options;
        const existingTranslations = await this.connection.getRepository(ctx, translationType).find({
            relationLoadStrategy: 'query',
            loadEagerRelations: false,
            where: { base: { id: input.id } } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            relations: ['base'],
        } as FindManyOptions<Translation<T>>);

        const differ = new TranslationDiffer(translationType, this.connection);
        const diff = differ.diff(existingTranslations, input.translations);
        const entity = await differ.applyDiff(
            ctx,
            new entityType({ ...input, translations: existingTranslations }),
            diff,
        );
        entity.updatedAt = new Date();

        const updatedEntity = patchEntity(entity, omit(input, ['translations']) as InputPatch<T>);
        if (typeof beforeSave === 'function') {
            await beforeSave(entity);
        }
        return this.connection.getRepository(ctx, entityType).save(updatedEntity, { data: typeOrmSubscriberData });
    }
}
