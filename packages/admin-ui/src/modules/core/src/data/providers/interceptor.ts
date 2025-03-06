/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_AUTH_TOKEN_HEADER_KEY } from '@firelancer/common/lib/shared-constants';
import { _ } from '@ngx-translate/core';
import { Observable, Subscription, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { MessageService } from 'primeng/api';
import { getAppConfig } from '../../app.config';
import { AuthService } from '../../providers/auth/auth.service';
import { LocalStorageService } from '../../providers/local-storage/local-storage.service';
import { DataService } from './data.service';

export const AUTH_REDIRECT_PARAM = 'redirectTo';

/**
 * The default interceptor examines all HTTP requests & responses and automatically updates the requesting state
 * and shows error notifications.
 */
@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
    private readonly tokenMethod = getAppConfig().tokenMethod;
    private readonly authTokenHeaderKey = getAppConfig().authTokenHeaderKey || DEFAULT_AUTH_TOKEN_HEADER_KEY;

    private dataService = inject(DataService);
    private injector = inject(Injector);
    private authService = inject(AuthService);
    private router = inject(Router);
    private localStorageService = inject(LocalStorageService);

    private logoutSubscription?: Subscription;

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.dataService.client.uiState().pipe(
            switchMap((uiState) => {
                const request = req.clone({
                    setParams: {
                        languageCode: uiState?.language ?? '',
                    },
                });
                return next.handle(request).pipe(
                    tap((event) => {
                        console.log({ event });
                        if (event instanceof HttpResponse) {
                            this.checkForAuthToken(event);
                        }
                    }),
                    catchError((err) => {
                        if (err instanceof HttpErrorResponse) {
                            this.notifyOnError(err);
                        }
                        return throwError(() => err);
                    }),
                );
            }),
        );
    }

    private notifyOnError(response: HttpErrorResponse) {
        const { apiHost, apiPort } = getAppConfig();
        if (response.status === 0) {
            return this.displayErrorNotification(_(`error.could-not-connect-to-server`), {
                url: `${apiHost}:${apiPort}`,
            });
        }

        if (response.error?.errorCode === 'FORBIDDEN_ERROR') {
            console.log(`intercepted: ${response.url}`);
            return this.authService.logOut().subscribe({
                next: () => {
                    console.log('this.authService.logOut().subscribe()');
                    const { loginUrl } = getAppConfig();
                    // If there is a `loginUrl` which is external to the AdminUI, redirect to it (with no query parameters)
                    if (loginUrl && !this.areUrlsOnSameOrigin(loginUrl, window.location.origin)) {
                        window.location.href = loginUrl;
                        return;
                    }
                    // Else, we build the login path from the login url if one is provided or fallback to `/login`
                    const loginPath = loginUrl ? this.getPathFromLoginUrl(loginUrl) : '/login';
                    if (!window.location.pathname.includes(loginPath)) {
                        this.displayErrorNotification(_(`error.403-forbidden`), { path: loginPath });
                    }
                    // Navigate to the `loginPath` route by ensuring the query param in charge of the redirection is provided
                    this.router.navigate([loginPath], {
                        queryParams: {
                            [AUTH_REDIRECT_PARAM]: btoa(this.router.url),
                        },
                    });
                },
                complete: () => this.cleanupLogout(),
                error: () => this.cleanupLogout(),
            });
        }

        return this.displayErrorNotification(response.error?.message);
    }

    /**
     * We need to lazily inject the NotificationService since it depends on the I18nService which
     * eventually depends on the HttpClient (used to load messages from json files). If we were to
     * directly inject NotificationService into the constructor, we get a cyclic dependency.
     */
    private displayErrorNotification(message: string, vars: Record<string, any> = {}): void {
        const messageService = this.injector.get<MessageService>(MessageService);
        messageService.add({ key: 'response-error', severity: 'error', summary: message, data: { vars } });
    }

    private checkForAuthToken(response: HttpResponse<any>) {
        if (this.tokenMethod === 'bearer') {
            const authToken = response.headers.get(this.authTokenHeaderKey);
            if (authToken) {
                this.localStorageService.set('authToken', authToken);
            }
        }
    }

    /**
     * Determine if two urls are on the same origin.
     */
    private areUrlsOnSameOrigin(urlA: string, urlB: string): boolean {
        return new URL(urlA).origin === new URL(urlB).origin;
    }

    /**
     * If the provided `loginUrl` is on the same origin than the AdminUI, return the path
     * after the `/admin`.
     * Else, return the whole login url.
     */
    private getPathFromLoginUrl(loginUrl: string): string {
        if (!this.areUrlsOnSameOrigin(loginUrl, window.location.origin)) {
            return loginUrl;
        }
        return loginUrl.split('/admin')[1];
    }

    private cleanupLogout() {
        if (this.logoutSubscription) {
            this.logoutSubscription.unsubscribe();
            this.logoutSubscription = undefined;
        }
    }
}
