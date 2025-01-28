import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Allow } from '../../../api/decorators/allow.decorator';
import { Ctx } from '../../../api/decorators/request-context.decorator';
import { Transaction } from '../../../api/decorators/transaction.decorator';
import {
    MutationAssignRoleToAdministratorArgs,
    MutationCreateAdministratorArgs,
    MutationDeleteAdministratorArgs,
    MutationUpdateActiveAdministratorArgs,
    MutationUpdateAdministratorArgs,
    Permission,
    QueryAdministratorArgs,
} from '../../../common/shared-schema';
import { RequestContext } from '../../../common';
import { Administrator } from '../../../entity/administrator/administrator.entity';
import { AdministratorService } from '../../../service';

@Controller('admins')
export class AdministratorController {
    constructor(private administratorService: AdministratorService) {}

    @Get()
    @Allow(Permission.ReadAdministrator)
    async administrators(@Ctx() ctx: RequestContext) {
        return this.administratorService.findAll(ctx);
    }

    @Get('active')
    @Allow(Permission.Owner)
    async activeAdministrator(@Ctx() ctx: RequestContext): Promise<Administrator | undefined> {
        if (ctx.activeUserId) {
            return this.administratorService.findOneByUserId(ctx, ctx.activeUserId);
        }
    }

    @Get(':id')
    @Allow(Permission.ReadAdministrator)
    async administrator(
        @Ctx() ctx: RequestContext,
        @Param() params: QueryAdministratorArgs,
    ): Promise<Administrator | undefined> {
        return this.administratorService.findOne(ctx, params.id);
    }

    @Transaction()
    @Post('create')
    @Allow(Permission.CreateAdministrator)
    async createAdministrator(
        @Ctx() ctx: RequestContext,
        @Body() args: MutationCreateAdministratorArgs,
    ): Promise<Administrator> {
        const { input } = args;
        return this.administratorService.create(ctx, input);
    }

    @Transaction()
    @Put()
    @Allow(Permission.UpdateAdministrator)
    async updateAdministrator(
        @Ctx() ctx: RequestContext,
        @Body() args: MutationUpdateAdministratorArgs,
    ): Promise<Administrator> {
        const { input } = args;
        return this.administratorService.update(ctx, input);
    }

    @Transaction()
    @Put('active')
    @Allow(Permission.Owner)
    async updateActiveAdministrator(
        @Ctx() ctx: RequestContext,
        @Body() args: MutationUpdateActiveAdministratorArgs,
    ): Promise<Administrator | undefined> {
        if (ctx.activeUserId) {
            const { input } = args;
            const administrator = await this.administratorService.findOneByUserId(ctx, ctx.activeUserId);
            if (administrator) {
                return this.administratorService.update(ctx, { ...input, id: administrator.id });
            }
        }
    }

    @Transaction()
    @Post('assign-role')
    @Allow(Permission.UpdateAdministrator)
    async assignRoleToAdministrator(
        @Ctx() ctx: RequestContext,
        @Body() args: MutationAssignRoleToAdministratorArgs,
    ): Promise<Administrator> {
        return this.administratorService.assignRole(ctx, args.administratorId, args.roleId);
    }

    @Transaction()
    @Delete(':id')
    @Allow(Permission.DeleteAdministrator)
    async deleteAdministrator(
        @Ctx() ctx: RequestContext,
        @Param() params: MutationDeleteAdministratorArgs,
    ): Promise<void> {
        const { id } = params;
        return this.administratorService.softDelete(ctx, id);
    }
}
