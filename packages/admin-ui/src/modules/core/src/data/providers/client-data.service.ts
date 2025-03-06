import { inject } from '@angular/core';
import { ClientState } from '../client-state/client-state.service';
import { Permission } from '@firelancer/common/lib/shared-schema';

export class ClientDataService {
    private clientState = inject(ClientState);

    userStatus() {
        return this.clientState.userStatus;
    }

    uiState() {
        return this.clientState.uiState;
    }

    loginSuccess(administratorId: string, username: string, permissions: Permission[]) {
        return this.clientState.setAsLoggedIn({ administratorId, username, permissions });
    }

    logOut() {
        return this.clientState.setAsLoggedOut();
    }

    setUiLanguage(languageCode: string, locale?: string) {
        return this.clientState.setUiLanguage(languageCode, locale);
    }

    setUiTheme(theme: string) {
        return this.clientState.setUiTheme(theme);
    }

    setMainNavExpanded(expanded: boolean) {
        return this.clientState.setMainNavExpanded(expanded);
    }
}
