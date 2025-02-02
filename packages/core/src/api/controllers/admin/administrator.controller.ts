import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Allow } from '../../../api/decorators/allow.decorator';
import { Ctx } from '../../../api/decorators/request-context.decorator';
import { Transaction } from '../../../api/decorators/transaction.decorator';
import {
    MutationAssignRoleToAdministratorArgs,
    MutationCreateAdministratorArgs,
    MutationDeleteAdministratorArgs,
    MutationDeleteAdministratorsArgs,
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
    async activeAdministrator(@Ctx() ctx: RequestContext) {
        if (ctx.activeUserId) {
            const activeAdministrator = await this.administratorService.findOneByUserId(ctx, ctx.activeUserId, [
                'user',
                'user.roles',
            ]);
            return { activeAdministrator };
        }

        return { activeAdministrator: null };
    }

    @Get(':id')
    @Allow(Permission.ReadAdministrator)
    async administrator(@Ctx() ctx: RequestContext, @Param() params: QueryAdministratorArgs) {
        return this.administratorService.findOne(ctx, params.id);
    }

    @Transaction()
    @Post('create')
    @Allow(Permission.CreateAdministrator)
    async createAdministrator(@Ctx() ctx: RequestContext, @Body() args: MutationCreateAdministratorArgs) {
        const createAdministrator = await this.administratorService.create(ctx, args.input);
        return { createAdministrator };
    }

    @Transaction()
    @Put()
    @Allow(Permission.UpdateAdministrator)
    async updateAdministrator(@Ctx() ctx: RequestContext, @Body() args: MutationUpdateAdministratorArgs) {
        const updateAdministrator = await this.administratorService.update(ctx, args.input);
        return { updateAdministrator };
    }

    @Transaction()
    @Put('active')
    @Allow(Permission.Owner)
    async updateActiveAdministrator(@Ctx() ctx: RequestContext, @Body() args: MutationUpdateActiveAdministratorArgs) {
        if (ctx.activeUserId) {
            const administrator = await this.administratorService.findOneByUserId(ctx, ctx.activeUserId);
            if (administrator) {
                const updateActiveAdministrator = await this.administratorService.update(ctx, {
                    ...args.input,
                    id: administrator.id,
                });

                return { updateActiveAdministrator };
            }
        }
        return { updateActiveAdministrator: null };
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
    async deleteAdministrator(@Ctx() ctx: RequestContext, @Param() params: MutationDeleteAdministratorArgs) {
        const deleteAdministrator = await this.administratorService.softDelete(ctx, params.id);
        return { deleteAdministrator };
    }

    @Transaction()
    @Delete()
    @Allow(Permission.DeleteAdministrator)
    deleteAdministrators(@Ctx() ctx: RequestContext, @Body() args: MutationDeleteAdministratorsArgs) {
        return Promise.all(args.ids.map((id) => this.administratorService.softDelete(ctx, id)));
    }
}
