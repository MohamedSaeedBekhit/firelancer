import { AttemptLoginMutation, GetCurrentUserQuery, LogOutMutation } from '@firelancer/common/lib/shared-schema';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ADMIN_API_BASE_URL } from '../data.module';

export class AuthDataService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(ADMIN_API_BASE_URL);

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
