import { LanguageCode } from '@firelancer/core';
import { join } from 'path';

export const DEFAULT_APP_PATH = join(__dirname, '../admin-ui');
export const loggerCtx = 'AdminUiPlugin';
export const defaultLanguage = LanguageCode.en;
export const defaultLocale = undefined;
export const defaultAvailableLanguages = [LanguageCode.ar, LanguageCode.en];
export const defaultAvailableLocales = ['AR', 'US'];
