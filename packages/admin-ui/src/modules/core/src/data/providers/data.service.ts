import { Injectable } from '@angular/core';
import { AuthDataService } from './auth-data.service';

@Injectable()
export class DataService {
    auth: AuthDataService;

    constructor() {
        this.auth = new AuthDataService();
    }
}
