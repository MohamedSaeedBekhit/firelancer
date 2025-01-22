import { Injectable, OnModuleInit } from '@nestjs/common';
import { Handler, Request } from 'express';
import * as fs from 'fs';
import i18next, { TFunction } from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import ICU from 'i18next-icu';
import path from 'path';
import { Logger } from '../config';
import { ConfigService } from '../config/config.service';
import { I18nError } from './i18n-error';

/**
 * @description
 * I18n resources used for translations
 */
export interface FirelancerTranslationResources {
    error: unknown;
    errorResult: unknown;
    message: unknown;
}

export interface I18nRequest extends Request {
    t: TFunction;
}

/**
 * This service is responsible for translating messages from the server before they reach the client.
 * The `i18next-express-middleware` middleware detects the client's preferred language based on
 * the `Accept-Language` header or "languageCode" query param and adds language-specific translation
 * functions to the Express request / response objects.
 */
@Injectable()
export class I18nService implements OnModuleInit {
    /**
     * @internal
     */
    constructor(private configService: ConfigService) {}

    /**
     * @internal
     */
    onModuleInit() {
        return i18next
            .use(i18nextMiddleware.LanguageDetector)
            .use(Backend as any) // eslint-disable-line @typescript-eslint/no-explicit-any
            .use(ICU)
            .init({
                nsSeparator: false,
                preload: ['en', 'ar'],
                fallbackLng: 'en',
                detection: {
                    lookupQuerystring: 'languageCode',
                },
                backend: {
                    loadPath: path.join(__dirname, 'messages/{{lng}}.json'),
                    jsonIndent: 2,
                },
            });
    }

    /**
     * @internal
     */
    handle(): Handler {
        return i18nextMiddleware.handle(i18next);
    }

    /**
     * @description
     * Add a I18n translation by json file
     *
     * @param langKey language key of the I18n translation file
     * @param filePath path to the I18n translation file
     */
    addTranslationFile(langKey: string, filePath: string): void {
        try {
            const rawData = fs.readFileSync(filePath);
            const resources = JSON.parse(rawData.toString('utf-8'));
            this.addTranslation(langKey, resources);
        } catch {
            Logger.error(`Could not load resources file ${filePath}`, 'I18nService');
        }
    }

    /**
     * @description
     * Add a I18n translation (key-value) resource
     *
     * @param langKey language key of the I18n translation file
     * @param resources key-value translations
     */
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    addTranslation(langKey: string, resources: FirelancerTranslationResources | any): void {
        i18next.addResourceBundle(langKey, 'translation', resources, true, true);
    }

    /**
     * Translates the originalError if it is an instance of I18nError.
     * @internal
     */
    translateError(req: I18nRequest, error: I18nError) {
        const t: TFunction = req.t;
        let translation = error.message;
        try {
            translation = t(error.message, error.variables);
        } catch (e) {
            if (e instanceof Error) {
                const message = typeof e.message === 'string' ? (e.message as string) : JSON.stringify(e.message);
                translation += ` (Translation format error: ${message})`;
            }
        }
        error.message = translation;
        // We can now safely remove the variables object so that they do not appear in
        // the error returned by the API
        delete (error as any).variables; // eslint-disable-line @typescript-eslint/no-explicit-any

        return error;
    }
}
