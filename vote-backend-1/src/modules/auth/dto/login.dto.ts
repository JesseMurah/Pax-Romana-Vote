import { IsEmail, IsPhoneNumber, IsString, MaxLength, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class LoginDto {
    @IsPhoneNumber('GH', { message: 'Please enter a valid Ghana phone number' })
    @Transform(({ value }) => value.replace(/\s/g, ''))
    phone: string;

    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
    @Transform(({ value }) => value.trim())
    name: string;
}

export class VerifySmsDto {
    @IsPhoneNumber('GH', { message: 'Please enter a valid Ghana phone number' })
    @Transform(({ value }) => value.replace(/\s/g, ''))
    phone: string;

    @IsString()
    @MinLength(6, { message: 'Verification code must be 6 digits' })
    @MaxLength(6, { message: 'Verification code must be 6 digits' })
    verificationCode: string;
}

// Updated admin login to use email instead of username
export class AdminLoginDto {
    @IsEmail({}, { message: 'Please enter a valid email address' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    password: string;
}

export class RefreshTokenDto {
    @IsString()
    refreshToken: string;
}