import { InjectionToken, NgModule } from '@angular/core';
import { DataService } from './providers/data.service';
import { getAppConfig } from '../app.config';
import { getServerLocation } from '../common/get-server-location';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DefaultInterceptor } from './providers/interceptor';

export const ADMIN_API_BASE_URL: InjectionToken<string> = new InjectionToken<string>('baseURL');

/**
 * The DataModule is responsible for all API calls
 */
@NgModule({
    imports: [],
    exports: [],
    declarations: [],
    providers: [
        DataService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: DefaultInterceptor,
            multi: true,
        },
        {
            provide: ADMIN_API_BASE_URL,
            useFactory: () => {
                const { adminApiPath } = getAppConfig();
                const serverLocation = getServerLocation();
                return `${serverLocation}/${adminApiPath}`;
            },
        },
    ],
})
export class DataModule {}
