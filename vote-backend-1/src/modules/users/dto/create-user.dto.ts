import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRoles } from '../enums/user-roles.enum'

export class CreateUserDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEmail()
    email: string;

    @IsString()
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
}