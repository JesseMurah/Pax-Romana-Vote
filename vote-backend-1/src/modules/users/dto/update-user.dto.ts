import { IsString, IsEnum, IsOptional, IsEmail, MinLength, MaxLength, IsBoolean, Matches } from 'class-validator';
import { UserRoles } from '../enums/user-roles.enum';

export class UpdateUserDTO {
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
    @IsOptional()
    name?: string;

    @IsString()
    @MinLength(10, { message: 'Phone number must be at least 10 characters long' })
    @MaxLength(15, { message: 'Phone number cannot exceed 15 characters' })
    @Matches(/^[+]?[0-9\s\-()]+$/, { message: 'Phone number must be valid' })
    @IsOptional()
    phone?: string;

    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsOptional()
    email?: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    @IsOptional()
    password?: string;

    @IsEnum(UserRoles)
    @IsOptional()
    role?: UserRoles;

    @IsString()
    @IsOptional()
    programme?: string;

    @IsString()
    @IsOptional()
    level?: string;

    @IsString()
    @IsOptional()
    subgroup?: string;

    @IsString()
    @IsOptional()
    college?: string;

    @IsBoolean()
    @IsOptional()
    phoneVerified?: boolean;

    @IsBoolean()
    @IsOptional()
    emailVerified?: boolean;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsBoolean()
    @IsOptional()
    inkVerified?: boolean;
}