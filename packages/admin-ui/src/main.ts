import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { loadAppConfig } from '@firelancer/admin-ui/core';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

loadAppConfig()
    .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
    .catch((err) => {
        console.log(err);
    });
