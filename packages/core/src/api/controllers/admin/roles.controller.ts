import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { RequestContext } from '../../../common';
import {
    MutationCreateRoleArgs,
    MutationDeleteRoleArgs,
    MutationDeleteRolesArgs,
    MutationUpdateRoleArgs,
    Permission,
    QueryRoleArgs,
} from '../../../common/shared-schema';
import { RoleService } from '../../../service';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';
import { Transaction } from '../../decorators/transaction.decorator';

@Controller('roles')
export class RoleController {
    constructor(private roleService: RoleService) {}

    @Get()
    @Allow(Permission.ReadAdministrator)
    async roles(@Ctx() ctx: RequestContext) {
        const roles = await this.roleService.findAll(ctx);
        return { roles };
    }

    @Get(':id')
    @Allow(Permission.ReadAdministrator)
    async role(@Ctx() ctx: RequestContext, @Param() params: QueryRoleArgs) {
        const role = await this.roleService.findOne(ctx, params.id);
        return { role };
    }

    @Transaction()
    @Post('create')
    @Allow(Permission.CreateAdministrator)
    async createRole(@Ctx() ctx: RequestContext, @Body() args: MutationCreateRoleArgs) {
        const createRole = await this.roleService.create(ctx, args.input);
        return { createRole };
    }

    @Transaction()
    @Put()
    @Allow(Permission.UpdateAdministrator)
    async updateRole(@Ctx() ctx: RequestContext, @Body() args: MutationUpdateRoleArgs) {
        const updateRole = await this.roleService.update(ctx, args.input);
        return { updateRole };
    }

    @Transaction()
    @Delete(':id')
    @Allow(Permission.DeleteAdministrator)
    async deleteRole(@Ctx() ctx: RequestContext, @Param() params: MutationDeleteRoleArgs) {
        const deleteRole = await this.roleService.delete(ctx, params.id);
        return { deleteRole };
    }

    @Transaction()
    @Delete()
    @Allow(Permission.DeleteAdministrator)
    async deleteRoles(@Ctx() ctx: RequestContext, @Body() args: MutationDeleteRolesArgs) {
        const deleteRoles = await Promise.all(args.ids.map((id) => this.roleService.delete(ctx, id)));
        return { deleteRoles };
    }
}
