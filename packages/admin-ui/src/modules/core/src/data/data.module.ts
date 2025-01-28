import { InjectionToken, NgModule } from '@angular/core';
import { DataService } from './providers/data.service';
import { BaseDataService } from './providers/base-data.service';

export const ADMIN_API_BASE_URL: InjectionToken<string> = new InjectionToken<string>('baseURL');

/**
 * The DataModule is responsible for all API calls
 */
@NgModule({
    imports: [],
    exports: [],
    declarations: [],
    providers: [
        {
            provide: ADMIN_API_BASE_URL,
            useValue: 'localhost:3001/admin-api',
        },
        BaseDataService,
        DataService,
    ],
})
export class DataModule {}
