import { AttemptLoginMutation, GetCurrentUserQuery, LogOutMutation } from '@firelancer/common/lib/shared-schema';
import { BaseDataService } from './base-data.service';

export class AuthDataService extends BaseDataService {
    currentUser() {
        return this.http.get<GetCurrentUserQuery>(`${this.baseUrl}/auth/me`);
    }

    attemptLogin(username: string, password: string, rememberMe: boolean) {
        return this.http.post<AttemptLoginMutation>(`${this.baseUrl}/auth/login`, {
            username,
            password,
            rememberMe,
        });
    }

    logOut() {
        return this.http.post<LogOutMutation>(`${this.baseUrl}/auth/logout`, {});
    }
}
