import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRoles } from "../users/enums/user-roles.enum";

@Controller('notifications/test')
// @UseGuards(RolesGuard)
@Roles(UserRoles.SUPER_ADMIN)
export class NotificationTestController {
  constructor(private notificationsService: NotificationService) {}

  @Post('sms')
  async testSms(@Body() body: { phoneNumber: string; message: string }) {
    return this.notificationsService.sendSms(body.phoneNumber, body.message);
  }

  @Post('email')
  async testEmail(@Body() body: { email: string; subject: string; message: string }) {
    return this.notificationsService.sendEmail(body.email, body.subject, body.message);
  }

  @Post('verification-code')
  async testVerificationCode(@Body() body: { phoneNumber: string }) {
    const code = '123456';
    return this.notificationsService.sendVerificationCode(body.phoneNumber, code);
  }
}
