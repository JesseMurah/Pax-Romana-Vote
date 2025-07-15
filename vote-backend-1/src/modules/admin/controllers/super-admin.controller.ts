import { AdminService } from "../services/admin.service";
import { UsersService } from "../../users/users.service";
import { Body, Controller, Get, Injectable, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserRoles } from "../../users/enums/user-roles.enum";
import { CreateAdminDTO } from "../../users/dto/create-admin.dto";
import {RolesGuard} from "../../auth/guards/roles.guard";


@Controller('admin/super-admin')
// @UseGuards(AuthGuard, JwtAuthGuard, RolesGuard)
@Roles(UserRoles.SUPER_ADMIN)
export class SuperAdminController {
    constructor(
        private adminService: AdminService,
        private userService: UsersService
    ) {}


    @Get('users')
    async getAdminUsers() {
        return this.adminService.getAdminUsers();
    }

    @Post('users')
    async createAdmin(@Body() createAdminDto: CreateAdminDTO, @Req() req) {
        const result = await this.userService.createAdmin(createAdminDto);

        await this.adminService.logAdminAction(
            req.user.id,
            'CREATE_ADMIN',
            { newAdminId: result.id, role: createAdminDto.role },
        );

        return result;
    }

    @Patch('users/:id/status')
    async updateUserStatus(
        @Param('id') userId: string,
        @Body() { isActive }: { isActive: boolean },
        @Req() req,
    ) {
        const result = await this.userService.updateUserStatus(userId, isActive);

        await this.adminService.logAdminAction(
            req.user.id,
            'UPDATE_USER_STATUS',
            { targetUserId: userId, isActive },
        );

        return result;
    }

    @Get('system/health')
    async getSystemHealth() {
        return this.adminService.getSystemHealth();
    }
}