import { Body, Controller, Get, Post, Request, Response } from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Allow } from '../../../api/decorators/allow.decorator';
import { Ctx } from '../../../api/decorators/request-context.decorator';
import { Transaction } from '../../../api/decorators/transaction.decorator';
import {
    AttemptLoginMutation,
    MutationAuthenticateArgs,
    MutationLoginArgs,
    Permission,
} from '../../../common/shared-schema';
import { NativeAuthStrategyError } from '../../../common/error/errors';
import { RequestContext } from '../../../common/request-context';
import { Logger } from '../../../config';
import { ConfigService } from '../../../config/config.service';
import { NATIVE_AUTH_STRATEGY_NAME } from '../../../config/strategies/authentication/default/native-authentication-strategy';
import { AdministratorService } from '../../../service/services/administrator.service';
import { AuthService } from '../../../service/services/auth.service';
import { UserService } from '../../../service/services/user.service';
import { BaseAuthController } from '../base/base-auth.controller';

@Controller('/auth')
export class AdminAuthController extends BaseAuthController {
    constructor(
        authService: AuthService,
        userService: UserService,
        administratorService: AdministratorService,
        configService: ConfigService,
    ) {
        super(authService, userService, administratorService, configService);
    }

    @Transaction()
    @Post('/login')
    @Allow(Permission.Public)
    async login(
        @Ctx() ctx: RequestContext,
        @Request() req: ExpressRequest,
        @Response() res: ExpressResponse,
        @Body() args: MutationLoginArgs,
    ) {
        this.requireNativeAuthStrategy();
        return super.baseLogin(args, ctx, req, res);
    }

    @Transaction()
    @Post('authenticate')
    @Allow(Permission.Public)
    async authenticate(
        @Body() args: MutationAuthenticateArgs,
        @Ctx() ctx: RequestContext,
        @Request() req: ExpressRequest,
        @Response() res: ExpressResponse,
    ) {
        const result = await this.authenticateAndCreateSession(ctx, args, req, res);
        res.send({ login: result } satisfies AttemptLoginMutation);
    }

    @Transaction()
    @Post('logout')
    @Allow(Permission.Public)
    async logout(@Ctx() ctx: RequestContext, @Request() req: ExpressRequest, @Response() res: ExpressResponse) {
        return super.logout(ctx, req, res);
    }

    @Get('me')
    @Allow(Permission.Public)
    @Allow(Permission.Authenticated, Permission.Owner)
    me(@Ctx() ctx: RequestContext) {
        return super.me(ctx, 'admin');
    }

    protected requireNativeAuthStrategy() {
        const { adminAuthenticationStrategy } = this.configService.authOptions;
        const nativeAuthStrategyIsConfigured = !!adminAuthenticationStrategy.find(
            (strategy) => strategy.name === NATIVE_AUTH_STRATEGY_NAME,
        );
        if (!nativeAuthStrategyIsConfigured) {
            const authStrategyNames = adminAuthenticationStrategy.map((s) => s.name).join(', ');
            const errorMessage =
                'This REST operation requires that the NativeAuthenticationStrategy be configured for the Admin API.\n' +
                `Currently the following AuthenticationStrategies are enabled: ${authStrategyNames}`;
            Logger.error(errorMessage);
            throw new NativeAuthStrategyError();
        }
    }
}
