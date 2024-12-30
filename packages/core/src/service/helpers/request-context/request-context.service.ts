import { Permission, intersect } from '@firelancer/common';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ApiType, getApiType } from '../../../common/get-api-type';
import { RequestContext } from '../../../common/request-context';
import { ConfigService } from '../../../config/config.service';
import { CachedSession, CachedSessionUser } from '../../../config/strategies/session-cache/session-cache-strategy';
import { User } from '../../../entity';
/* eslint-disable-next-line @typescript-eslint/no-require-imports */
const ms = require('ms');

/**
 * @description
 * Creates new link instances.
 */
@Injectable()
export class RequestContextService {
    constructor(private configService: ConfigService) {}

    /**
     * @description
     * Creates a RequestContext based on the config provided. This can be useful when interacting
     * with services outside the request-response cycle, for example in stand-alone scripts or in
     * worker jobs.
     */
    create(config: { req?: Request; apiType: ApiType; user?: User }): RequestContext {
        const { req, apiType, user } = config;
        let session: CachedSession | undefined;
        if (user) {
            session = {
                user: {
                    id: user.id,
                    identifier: user.identifier,
                    verified: user.verified,
                    permissions: user.roles.flatMap((role) => role.permissions),
                },
                id: 0,
                token: '__dummy_session_token__',
                expires: new Date(Date.now() + ms('1y')),
                cacheExpiry: ms('1y'),
            };
        }
        return new RequestContext({
            req,
            apiType,
            session,
            isAuthorized: true,
            authorizedAsOwnerOnly: false,
        });
    }

    /**
     * @description
     * Creates a new RequestContext based on an Express request object. This is used internally
     * in the API layer by the AuthGuard, and creates the RequestContext which is then passed
     * to all resolvers & controllers.
     */
    fromRequest(req: Request, session?: CachedSession, requiredPermissions?: Permission[]): RequestContext {
        const apiType = getApiType(req);

        const hasOwnerPermission = !!requiredPermissions && requiredPermissions.includes(Permission.Owner);
        const user = session && session.user;
        const isAuthorized = this.userHasPermissions(requiredPermissions ?? [], user);
        const authorizedAsOwnerOnly = !isAuthorized && hasOwnerPermission;
        return new RequestContext({
            req,
            apiType,
            session,
            isAuthorized,
            authorizedAsOwnerOnly,
        });
    }

    /**
     * TODO: Deprecate and remove, since this function is now handled internally in the RequestContext.
     */
    userHasPermissions(permissions: Permission[], user?: CachedSessionUser): boolean {
        if (!user) {
            return false;
        }
        if (permissions.length === 0) {
            return true;
        }
        const matched = intersect(permissions, user.permissions);
        return matched.length === permissions.length;
    }
}
