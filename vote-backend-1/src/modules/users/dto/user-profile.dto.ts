import { IsString, IsEnum, IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { UserRoles } from '../enums/user-roles.enum';

export class UserProfileDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsString()
    phoneNumber: string;

    @IsEnum(UserRoles)
    role: UserRoles;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsBoolean()
    @IsOptional()
    phoneVerified?: boolean;

    @IsBoolean()
    @IsOptional()
    emailVerified?: boolean;

    @IsBoolean()
    @IsOptional()
    hasVoted?: boolean;

    @IsBoolean()
    @IsOptional()
    inkVerified?: boolean
}

export class UserStatsDto {
    @IsString()
    totalUsers: number;

    @IsString()
    totalAdmins: number;

    @IsString()
    totalAspirants: number;

    @IsString()
    totalVoters: number;

    @IsString()
    verifiedUsers: number;

    @IsString()
    activeUsers: number;
}