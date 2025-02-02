import { Permission } from '@firelancer/common/lib/shared-schema';

export interface UserStatus {
    administratorId?: string | null;
    username?: string | null;
    isLoggedIn: boolean;
    loginTime?: Date | null;
    permissions: Permission[];
}

export interface UiState {
    language?: string;
    locale?: string;
    theme?: string;
    mainNavExpanded?: boolean;
}
