import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import {
    CreateAdministratorInput,
    CreateAdministratorMutation,
    CreateRoleInput,
    CreateRoleMutation,
    DeleteAdministratorMutation,
    DeleteAdministratorsMutation,
    DeleteRoleMutation,
    DeleteRolesMutation,
    GetActiveAdministratorQuery,
    GetRolesQuery,
    UpdateActiveAdministratorInput,
    UpdateActiveAdministratorMutation,
    UpdateAdministratorInput,
    UpdateAdministratorMutation,
    UpdateRoleInput,
    UpdateRoleMutation,
} from '@firelancer/common/lib/shared-schema';
import { ADMIN_API_BASE_URL } from '../data.module';

export class AdministratorDataService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(ADMIN_API_BASE_URL);

    getActiveAdministrator() {
        return this.http.get<GetActiveAdministratorQuery>(`${this.baseUrl}/admins/active`);
    }

    createAdministrator(input: CreateAdministratorInput) {
        return this.http.post<CreateAdministratorMutation>(`${this.baseUrl}/admins/create`, { input });
    }

    updateAdministrator(input: UpdateAdministratorInput) {
        return this.http.put<UpdateAdministratorMutation>(`${this.baseUrl}/admins`, { input });
    }

    updateActiveAdministrator(input: UpdateActiveAdministratorInput) {
        return this.http.put<UpdateActiveAdministratorMutation>(`${this.baseUrl}/admins/active`, { input });
    }

    deleteAdministrator(id: string) {
        return this.http.delete<DeleteAdministratorMutation>(`${this.baseUrl}/admins/${id}`);
    }

    deleteAdministrators(ids: string[]) {
        return this.http.delete<DeleteAdministratorsMutation>(`${this.baseUrl}/admins`, { body: { ids } });
    }

    getRoles(take = 10, skip = 0) {
        return this.http.get<GetRolesQuery>(`${this.baseUrl}/roles`, {
            params: {
                take,
                skip,
            },
        });
    }

    createRole(input: CreateRoleInput) {
        return this.http.post<CreateRoleMutation>(`${this.baseUrl}/roles/create`, { input });
    }

    updateRole(input: UpdateRoleInput) {
        return this.http.put<UpdateRoleMutation>(`${this.baseUrl}/roles`, { input });
    }

    deleteRole(id: string) {
        return this.http.delete<DeleteRoleMutation>(`${this.baseUrl}/roles/${id}`);
    }

    deleteRoles(ids: string[]) {
        return this.http.delete<DeleteRolesMutation>(`${this.baseUrl}/roles`, { body: { ids } });
    }
}
