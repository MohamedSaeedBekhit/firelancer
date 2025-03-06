import { inject, Injectable } from '@angular/core';
import { Permission } from '@firelancer/common/lib/shared-schema';
import { map, of } from 'rxjs';
import { LocalStorageService } from '../../providers/local-storage/local-storage.service';
import { getClientDefaults } from './client-defaults';
import { UiState, UserStatus } from './client-types';

@Injectable({ providedIn: 'root' })
export class ClientState {
    private localStorageService = inject(LocalStorageService);
    private defaults = getClientDefaults(this.localStorageService);

    private _userStatus: UserStatus = this.defaults.userStatus;
    private _uiState: UiState = this.defaults.uiState;

    get userStatus() {
        return of(this._userStatus);
    }

    get uiState() {
        return of(this._uiState);
    }

    setAsLoggedIn(input: { administratorId: string; username: string; permissions: Permission[] }) {
        this._userStatus = {
            administratorId: input.administratorId,
            username: input.username,
            permissions: input.permissions,
            loginTime: new Date(),
            isLoggedIn: true,
        };
        return of(this._userStatus);
    }

    setAsLoggedOut() {
        this._userStatus = {
            administratorId: null,
            username: null,
            permissions: [],
            loginTime: null,
            isLoggedIn: false,
        };
        return of(this._userStatus);
    }

    setUiLanguage(languageCode: string, locale?: string) {
        this._uiState = { ...this._uiState, language: languageCode, locale };
        return of(this._uiState).pipe(map(({ language, locale }) => ({ language, locale })));
    }

    setUiTheme(theme: string) {
        this._uiState = { ...this._uiState, theme };
        return of(this._uiState).pipe(map(({ theme }) => ({ theme })));
    }

    setMainNavExpanded(expanded: boolean) {
        this._uiState = { ...this._uiState, mainNavExpanded: expanded };
        return of(this._uiState).pipe(map(({ mainNavExpanded }) => ({ mainNavExpanded })));
    }
}
