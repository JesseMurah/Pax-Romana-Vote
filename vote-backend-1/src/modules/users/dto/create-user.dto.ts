import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from "@prisma/client/index";

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

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

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