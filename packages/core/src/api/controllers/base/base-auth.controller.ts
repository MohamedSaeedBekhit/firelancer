import { Request, Response } from 'express';
import {
    AttemptLoginMutation,
    CurrentUser,
    GetCurrentUserQuery,
    LogOutMutation,
    MutationAuthenticateArgs,
    MutationLoginArgs,
} from '../../../common/shared-schema';
import { ForbiddenError, InvalidCredentialsError } from '../../../common/error/errors';
import { extractSessionToken } from '../../../common/extract-session-token';
import { ApiType } from '../../../common/get-api-type';
import { RequestContext } from '../../../common/request-context';
import { setSessionToken } from '../../../common/set-session-token';
import { LogLevel } from '../../../config';
import { ConfigService } from '../../../config/config.service';
import { AuthOptions } from '../../../config/firelancer-config';
import { NATIVE_AUTH_STRATEGY_NAME } from '../../../config/strategies/authentication/default/native-authentication-strategy';
import { User } from '../../../entity';
import { AdministratorService } from '../../../service/services/administrator.service';
import { AuthService } from '../../../service/services/auth.service';
import { UserService } from '../../../service/services/user.service';
import { getUserPermissions } from '../../../service/helpers/utils/get-user-permissions';

export class BaseAuthController {
    constructor(
        protected authService: AuthService,
        protected userService: UserService,
        protected administratorService: AdministratorService,
        protected configService: ConfigService,
    ) {}

    /**
     * Attempts a login given the username and password of a user. If successful, returns
     * the user data and returns the token either in a cookie or in the response body.
     */
    async baseLogin(args: MutationLoginArgs, ctx: RequestContext, req: Request, res: Response) {
        const result = await this.authenticateAndCreateSession(
            ctx,
            {
                input: { [NATIVE_AUTH_STRATEGY_NAME]: args },
                rememberMe: args.rememberMe,
            },
            req,
            res,
        );

        return res.send({ login: result } satisfies AttemptLoginMutation);
    }

    async logout(ctx: RequestContext, req: Request, res: Response) {
        const authOptions = this.configService.authOptions;
        const token = extractSessionToken(req, authOptions.tokenMethod);
        if (!token) {
            return res.send({ logout: { success: false } } satisfies LogOutMutation);
        }

        await this.authService.destroyAuthenticatedSession(ctx, token);

        setSessionToken({
            req,
            res,
            authOptions: authOptions as Required<AuthOptions>,
            rememberMe: false,
            sessionToken: '',
        });

        return res.send({ logout: { success: true } } satisfies LogOutMutation);
    }

    /**
     * Returns information about the current authenticated user.
     */
    async me(ctx: RequestContext, apiType: ApiType): Promise<GetCurrentUserQuery> {
        const userId = ctx.activeUserId;
        if (!userId) {
            throw new ForbiddenError(LogLevel.Verbose);
        }
        if (apiType === 'admin') {
            const administrator = await this.administratorService.findOneByUserId(ctx, userId, ['user.roles']);
            if (!administrator) {
                throw new ForbiddenError(LogLevel.Verbose);
            }
        }
        const user = userId && (await this.userService.getUserById(ctx, userId));
        return { me: user ? this.publiclyAccessibleUser(user) : null };
    }

    /**
     * Creates an authenticated session and sets the session token.
     */
    protected async authenticateAndCreateSession(
        ctx: RequestContext,
        args: MutationAuthenticateArgs,
        req: Request,
        res: Response,
    ): Promise<CurrentUser> {
        const [method, data] = Object.entries(args.input)[0];
        const { apiType } = ctx;

        const session = await this.authService.authenticate(ctx, apiType, method, data);

        if (apiType === 'admin') {
            const administrator = await this.administratorService.findOneByUserId(ctx, session.user.id);
            if (!administrator) {
                throw new InvalidCredentialsError({ authenticationError: '' });
            }
        }

        setSessionToken({
            req,
            res,
            sessionToken: session.token,
            rememberMe: args.rememberMe || false,
            authOptions: this.configService.authOptions,
        });

        return this.publiclyAccessibleUser(session.user);
    }

    /**
     * Updates the password of an existing User.
     */
    protected async updatePassword(ctx: RequestContext, currentPassword: string, newPassword: string): Promise<void> {
        const { activeUserId } = ctx;
        if (!activeUserId) {
            throw new ForbiddenError();
        }

        await this.userService.updatePassword(ctx, activeUserId, currentPassword, newPassword);
    }

    /**
     * Exposes a subset of the User properties which we want to expose to the public API.
     */
    protected publiclyAccessibleUser(user: User): CurrentUser {
        return {
            id: user.id,
            identifier: user.identifier,
            permissions: getUserPermissions(user),
        };
    }
}
