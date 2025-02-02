import { getDefaultUiLanguage, getDefaultUiLocale } from '../../common/get-default-ui-language';
import { LocalStorageService } from '../../providers/local-storage/local-storage.service';
import { UiState, UserStatus } from './client-types';

export function getClientDefaults(localStorageService: LocalStorageService) {
    const currentLanguage = localStorageService.get('uiLanguageCode') || getDefaultUiLanguage();
    const currentLocale = localStorageService.get('uiLocale') || getDefaultUiLocale();
    const activeTheme = localStorageService.get('activeTheme') || 'default';
    return {
        userStatus: {
            administratorId: null,
            username: '',
            isLoggedIn: false,
            loginTime: null,
            permissions: [],
        } satisfies UserStatus,
        uiState: {
            language: currentLanguage,
            locale: currentLocale || '',
            theme: activeTheme,
            mainNavExpanded: true,
        } satisfies UiState,
    };
}
