import { Permission } from '../../../common/shared-schema';
import { Role } from '../../../entity/role/role.entity';
import { User } from '../../../entity/user/user.entity';

/**
 * Returns an array of global permissions for the given User.
 */
export function getUserPermissions(user: User): Permission[] {
    return getPermissions(user.roles);
}

/**
 * @description
 * Returns a unique array of global permissions for the given Roles.
 */
export function getPermissions(roles: Role[]): Permission[] {
    const permissionsSet = new Set<Permission>();

    for (const role of roles) {
        for (const permission of role.permissions) {
            permissionsSet.add(permission);
        }
    }

    return Array.from(permissionsSet);
}
