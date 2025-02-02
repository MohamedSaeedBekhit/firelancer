import { Injectable } from '@angular/core';
import { AuthDataService } from './auth-data.service';
import { ClientDataService } from './client-data.service';
import { AdministratorDataService } from './administrator-data.service';

@Injectable()
export class DataService {
    auth: AuthDataService;
    client: ClientDataService;
    administrator: AdministratorDataService;

    constructor() {
        this.auth = new AuthDataService();
        this.client = new ClientDataService();
        this.administrator = new AdministratorDataService();
    }
}
