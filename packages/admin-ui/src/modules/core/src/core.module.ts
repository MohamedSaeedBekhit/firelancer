import { PlatformLocation } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'primeng/api';

import { getAppConfig } from './app.config';
import { getDefaultUiLanguage, getDefaultUiLocale } from './common/get-default-ui-language';
import { DataModule } from './data/data.module';
import { CustomHttpTranslationLoader } from './providers/i18n/custom-http-loader';
import { I18nService } from './providers/i18n/i18n.service';
import { LocalStorageService } from './providers/local-storage/local-storage.service';

@NgModule({
    imports: [
        SharedModule,
        BrowserModule,
        BrowserAnimationsModule,
        DataModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient, PlatformLocation],
            },
        }),
    ],
    exports: [SharedModule],
    providers: [Title],
})
export class CoreModule {
    private i18nService = inject(I18nService);
    private titleService = inject(Title);
    private localStorageService = inject(LocalStorageService);

    constructor() {
        this.initUiLanguagesAndLocales();
        this.initUiTitle();
    }

    private initUiLanguagesAndLocales() {
        const defaultLanguage = getDefaultUiLanguage();
        const defaultLocale = getDefaultUiLocale();

        const lastLanguage = this.localStorageService.get('uiLanguageCode');
        const availableLanguages = getAppConfig().availableLanguages;
        const availableLocales = getAppConfig().availableLocales ?? [defaultLocale];

        if (!!defaultLanguage && !availableLanguages.includes(defaultLanguage)) {
            throw new Error(
                `The defaultLanguage "${defaultLanguage}" must be one of the availableLanguages [${availableLanguages
                    .map((l) => `"${l}"`)
                    .join(', ')}]`,
            );
        }

        if (!!defaultLocale && !availableLocales.includes(defaultLocale)) {
            throw new Error(
                `The defaultLocale "${defaultLocale}" must be one of the availableLocales [${availableLocales
                    .map((l) => `"${l}"`)
                    .join(', ')}]`,
            );
        }

        const uiLanguage = lastLanguage && availableLanguages.includes(lastLanguage) ? lastLanguage : defaultLanguage;

        this.localStorageService.set('uiLanguageCode', uiLanguage);

        this.i18nService.setLanguage(uiLanguage);
        this.i18nService.setDefaultLanguage(defaultLanguage);
        this.i18nService.setAvailableLanguages(availableLanguages || [defaultLanguage]);
        this.i18nService.setAvailableLocales(availableLocales || [defaultLocale]);
    }

    private initUiTitle() {
        const title = getAppConfig().brand || 'Firelancer';
        this.titleService.setTitle(title);
    }
}

export function HttpLoaderFactory(http: HttpClient, location: PlatformLocation) {
    // Dynamically get the baseHref, which is configured in the angular.json file
    const baseHref = location.getBaseHrefFromDOM();
    return new CustomHttpTranslationLoader(http, baseHref + 'i18n-messages/');
}
