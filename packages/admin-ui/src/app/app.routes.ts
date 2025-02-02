import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'login', loadChildren: () => import('@firelancer/admin-ui/login').then((m) => m.LoginModule) },
];
