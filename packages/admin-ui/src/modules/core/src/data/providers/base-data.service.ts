import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ADMIN_API_BASE_URL } from '../data.module';

@Injectable()
export class BaseDataService {
    protected readonly http = inject(HttpClient);
    protected readonly baseUrl = inject(ADMIN_API_BASE_URL);
}
