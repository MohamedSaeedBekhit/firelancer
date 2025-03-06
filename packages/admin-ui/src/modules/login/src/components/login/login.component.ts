import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@firelancer/admin-ui/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { AUTH_REDIRECT_PARAM } from '@firelancer/admin-ui/core';

@Component({
    selector: 'flr-login',
    templateUrl: 'login.component.html',
    standalone: false,
})
export class LoginComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);
    private formBuilder = inject(FormBuilder);

    form: FormGroup;
    loading = false;
    errorMessage?: string;

    get username() {
        return this.form.get('username');
    }

    get password() {
        return this.form.get('password');
    }

    get rememberMe() {
        return this.form.get('rememberMe');
    }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
            rememberMe: [false],
        });
    }

    onSubmit(): void {
        this.loading = true;
        this.errorMessage = undefined;
        this.authService
            .logIn(this.username?.value, this.password?.value, this.rememberMe?.value)
            .pipe(
                catchError((err) => {
                    this.errorMessage = err.error?.message ?? 'Login failed. Please try again.';
                    return EMPTY;
                }),
                finalize(() => (this.loading = false)),
            )
            .subscribe(() => this.router.navigateByUrl(this.getRedirectRoute() || '/'));
    }

    /**
     * Extracts the `redirectTo` query param from the URL and decodes it.
     */
    private getRedirectRoute(): string | undefined {
        try {
            const params = new URLSearchParams(window.location.search);
            const encodedRedirect = params.get(AUTH_REDIRECT_PARAM);
            return encodedRedirect ? atob(decodeURIComponent(encodedRedirect)) : undefined;
        } catch {
            return undefined;
        }
    }
}
