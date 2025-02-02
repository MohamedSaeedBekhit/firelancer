import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@firelancer/admin-ui/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * This guard prevents loggen-in users from navigating to the login screen.
 */
@Injectable({
    providedIn: 'root',
})
export class LoginGuard {
    private router = inject(Router);
    private authService = inject(AuthService);

    canActivate(): Observable<boolean> {
        return this.authService.checkAuthenticatedStatus().pipe(
            map((authenticated) => {
                if (authenticated) {
                    this.router.navigate(['/']);
                }
                return !authenticated;
            }),
        );
    }
}
