import { Injectable } from '@nestjs/common';
import { Translatable, RequestContext } from '../../../common';
import { ConfigService } from '../../../config';
import { FirelancerEntity } from '../../../entity';
import { DeepTranslatableRelations, translateDeep } from '../utils/translate-entity';

/**
 * @description
 * The TranslatorService is used to translate entities into the current language.
 */
@Injectable()
export class TranslatorService {
    constructor(private configService: ConfigService) {}

    translate<T extends Translatable & FirelancerEntity>(
        translatable: T,
        ctx: RequestContext,
        translatableRelations: DeepTranslatableRelations<T> = [],
    ) {
        return translateDeep(
            translatable,
            [ctx.languageCode, this.configService.defaultLanguageCode],
            translatableRelations,
        );
    }
}
