import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@firelancer/admin-ui/core';

export const AUTH_REDIRECT_PARAM = 'redirectTo';

@Component({
    selector: 'flr-login',
    templateUrl: 'login.component.html',
    standalone: false,
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);
    private formBuilder = inject(FormBuilder);

    loginForm: FormGroup;
    loading = false;
    errorMessage: string | undefined;
    returnUrl: string;
    submitted: boolean;

    get f() {
        return this.loginForm.controls;
    }

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
            rememberMe: [false],
        });
    }

    onSubmit() {
        this.submitted = true;
        this.errorMessage = undefined;

        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;

        this.authService
            .logIn(this.f['username'].value, this.f['password'].value, this.f['rememberMe'].value)
            .subscribe(() => {
                const redirect = this.getRedirectRoute();
                this.router.navigateByUrl(redirect ? redirect : '/');
            });

        this.loading = false;
    }

    /**
     * Attempts to read a redirect param from the current url and parse it into a
     * route from which the user was redirected after a 401 error.
     */
    private getRedirectRoute(): string | undefined {
        let redirectTo: string | undefined;
        const re = new RegExp(`${AUTH_REDIRECT_PARAM}=(.*)`);
        try {
            const redirectToParam = window.location.search.match(re);
            if (redirectToParam && 1 < redirectToParam.length) {
                redirectTo = atob(decodeURIComponent(redirectToParam[1]));
            }
        } catch {
            // ignore
        }
        return redirectTo;
    }
}
