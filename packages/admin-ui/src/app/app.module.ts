import { CommonModule } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RouterModule } from '@angular/router';
import { AppComponent, AppComponentModule } from '@firelancer/admin-ui/core';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';

@NgModule({
    declarations: [],
    imports: [CommonModule, AppComponentModule, RouterModule.forRoot(routes, { useHash: false })],
    bootstrap: [AppComponent],
    providers: [
        provideHttpClient(withFetch(), withInterceptorsFromDi()),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    prefix: 'p',
                    darkModeSelector: 'system',
                    cssLayer: false,
                },
            },
        }),
    ],
})
export class AppModule {}
