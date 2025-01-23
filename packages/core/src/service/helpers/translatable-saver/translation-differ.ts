import { DeepPartial, foundIn, not } from '@firelancer/common';
import { RequestContext, InternalServerError, Translatable, Translation, TranslationInput } from '../../../common';
import { TransactionalConnection } from '../../../connection/transactional-connection';

export type TranslationContructor<T> = new (
    input?: DeepPartial<TranslationInput<T>> | DeepPartial<Translation<T>>,
) => Translation<T>;

export interface TranslationDiff<T> {
    toUpdate: Array<Translation<T>>;
    toAdd: Array<Translation<T>>;
}

/**
 * This class is to be used when performing an update on a Translatable entity.
 */
export class TranslationDiffer<Entity extends Translatable> {
    constructor(
        private translationCtor: TranslationContructor<Entity>,
        private connection: TransactionalConnection,
    ) {}

    /**
     * Compares the existing translations with the updated translations and produces a diff of
     * added, removed and updated translations.
     */
    diff(
        existing: Array<Translation<Entity>>,
        updated?: Array<TranslationInput<Entity>> | null,
    ): TranslationDiff<Entity> {
        if (updated) {
            const translationEntities = this.translationInputsToEntities(updated, existing);
            const toAdd = translationEntities.filter(not(foundIn(existing, 'languageCode')));
            const toUpdate = translationEntities.filter(foundIn(existing, 'languageCode'));

            return { toUpdate, toAdd };
        } else {
            return {
                toUpdate: [],
                toAdd: [],
            };
        }
    }

    async applyDiff(
        ctx: RequestContext,
        entity: Entity,
        { toUpdate, toAdd }: TranslationDiff<Entity>,
    ): Promise<Entity> {
        if (toUpdate.length) {
            for (const translation of toUpdate) {
                const updated = await this.connection.getRepository(ctx, this.translationCtor).save(translation);
                const index = entity.translations.findIndex((t) => t.languageCode === updated.languageCode);
                entity.translations.splice(index, 1, updated as any); // eslint-disable-line @typescript-eslint/no-explicit-any
            }
        }

        if (toAdd.length) {
            for (const translation of toAdd) {
                translation.base = entity;
                let newTranslation: any; // eslint-disable-line @typescript-eslint/no-explicit-any
                try {
                    newTranslation = await this.connection.getRepository(ctx, this.translationCtor).save(translation);
                } catch (err) {
                    throw new InternalServerError(
                        err instanceof Error ? err.message : "Couldn't save translation entity",
                    );
                }
                entity.translations.push(newTranslation);
            }
        }

        return entity;
    }

    private translationInputsToEntities(
        inputs: Array<TranslationInput<Entity>>,
        existing: Array<Translation<Entity>>,
    ): Array<Translation<Entity>> {
        return inputs.map((input) => {
            const counterpart = existing.find((e) => e.languageCode === input.languageCode);
            const entity = new this.translationCtor(input);
            if (counterpart) {
                entity.id = counterpart.id;
                entity.base = counterpart.base;
            }
            return entity;
        });
    }
}
