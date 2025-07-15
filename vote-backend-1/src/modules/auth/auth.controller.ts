import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {AdminLoginDto, LoginDto, RefreshTokenDto, VerifySmsDto} from "./dto/login.dto";
import {AuthResponseDto, VerificationResponseDto} from "./dto/auth-response.dto";
import {JwtAuthGuard} from "./guards/jwt-auth.guard";
import { ThrottlerGuard } from '@nestjs/throttler'
import {CurrentUser} from "./decorators/current-user.decorator";

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('send-code')
  @HttpCode(HttpStatus.OK)
  async sendVerificationCode(@Body() loginDto: LoginDto): Promise<VerificationResponseDto> {
    try {
      //@ts-ignore
      return await this.authService.sendVerificationCode(loginDto);
    } catch (error) {
      this.logger.error('Failed to send verification code:', error);
      throw error;
    }
  }

  @Post('verify-login')
  @HttpCode(HttpStatus.OK)
  async verifyAndLogin(@Body() verifySmsDto: VerifySmsDto): Promise<AuthResponseDto> {
    try {
      return await this.authService.verifyAndLogin(verifySmsDto);
    } catch (error) {
      this.logger.error('Failed to verify and login:', error);
      throw error;
    }
  }

  @Post('admin-login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() adminLoginDto: AdminLoginDto): Promise<AuthResponseDto> {
    try {
      return await this.authService.adminLogin(adminLoginDto);
    } catch (error) {
      this.logger.error('Failed admin login:', error);
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ access_token: string }> {
    try {
      return await this.authService.refreshToken(refreshTokenDto);
    } catch (error) {
      this.logger.error('Failed to refresh token:', error);
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any): Promise<{ message: string }> {
    try {
      return await this.authService.logout(user.id);
    } catch (error) {
      this.logger.error('Failed to logout:', error);
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    try {
      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
      };
    } catch (error) {
      this.logger.error('Failed to get profile:', error);
      throw error;
    }
  }
}