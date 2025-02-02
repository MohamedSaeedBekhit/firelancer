import { LanguageCode } from '@firelancer/common/lib/shared-schema';
import { getAppConfig } from '../app.config';

export function getDefaultUiLanguage(): LanguageCode {
    return getAppConfig().defaultLanguage;
}

export function getDefaultUiLocale(): string | undefined {
    const defaultLocale = getAppConfig().defaultLocale;
    if (defaultLocale) {
        return defaultLocale;
    }
    return navigator.language.split('-')[1]?.toUpperCase();
}
