import { inject, Injectable } from '@angular/core';
import { Permission } from '@firelancer/common/lib/shared-schema';
import { BehaviorSubject, map } from 'rxjs';
import { LocalStorageService } from '../../providers/local-storage/local-storage.service';
import { getClientDefaults } from './client-defaults';
import { UiState, UserStatus } from './client-types';

@Injectable({ providedIn: 'root' })
export class ClientState {
    localStorageService = inject(LocalStorageService);
    defaults = getClientDefaults(this.localStorageService);

    private userStatusSubject = new BehaviorSubject<UserStatus>(this.defaults.userStatus);
    userStatus$ = this.userStatusSubject.asObservable();

    private uiStateSubject = new BehaviorSubject<UiState>(this.defaults.uiState);
    uiState$ = this.uiStateSubject.asObservable();

    setAsLoggedIn(input: { administratorId: string; username: string; permissions: Permission[] }) {
        const data = {
            administratorId: input.administratorId,
            username: input.username,
            permissions: input.permissions,
            loginTime: new Date(),
            isLoggedIn: true,
        };
        this.userStatusSubject.next(data);
        return this.userStatus$;
    }

    setAsLoggedOut() {
        const data = {
            administratorId: null,
            username: null,
            permissions: [],
            loginTime: null,
            isLoggedIn: false,
        };
        this.userStatusSubject.next(data);
        return this.userStatus$;
    }

    setUiLanguage(languageCode: string, locale?: string) {
        this.uiStateSubject.next({ ...this.uiStateSubject.value, language: languageCode, locale });
        return this.uiState$.pipe(map(({ language, locale }) => ({ language, locale })));
    }

    setUiTheme(theme: string) {
        this.uiStateSubject.next({ ...this.uiStateSubject.value, theme });
        return this.uiState$.pipe(map(({ theme }) => ({ theme })));
    }

    setMainNavExpanded(expanded: boolean) {
        this.uiStateSubject.next({ ...this.uiStateSubject.value, mainNavExpanded: expanded });
        return this.uiState$.pipe(map(({ mainNavExpanded }) => ({ mainNavExpanded })));
    }
}
