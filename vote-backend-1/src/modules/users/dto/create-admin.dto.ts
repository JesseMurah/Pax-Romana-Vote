import {IsString, IsEnum, IsEmail, MinLength, MaxLength, Matches, IsOptional} from 'class-validator';
import { UserRoles } from '../enums/user-roles.enum';

export class CreateAdminDTO {
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
    name: string;

    @IsString()
    @MinLength(10, { message: 'Phone number must be at least 10 characters long' })
    @MaxLength(15, { message: 'Phone number cannot exceed 15 characters' })
    @Matches(/^[+]?[0-9\s\-()]+$/, { message: 'Phone number must be valid' })
    phone: string;

    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password: string;

    @IsEnum([UserRoles.SUPER_ADMIN, UserRoles.EC_MEMBER, UserRoles.ADMIN], {
        message: 'Admin role must be either SUPER_ADMIN, EC_MEMBER, or ADMIN',
    })
    role: UserRoles.SUPER_ADMIN | UserRoles.EC_MEMBER | UserRoles.ADMIN;

    // Optional profile fields from schema
    @IsOptional()
    @IsString()
    programme?: string;

    @IsOptional()
    @IsString()
    level?: string;

    @IsOptional()
    @IsString()
    subgroup?: string;

    @IsOptional()
    @IsString()
    college?: string;
}
