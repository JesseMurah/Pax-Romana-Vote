import { UserRoles } from '../enums/user-roles.enum';
export declare class UserProfileDto {
    id: string;
    name: string;
    phoneNumber: string;
    role: UserRoles;
    isActive?: boolean;
    phoneVerified?: boolean;
    emailVerified?: boolean;
    hasVoted?: boolean;
    inkVerified?: boolean;
}
export declare class UserStatsDto {
    totalUsers: number;
    totalAdmins: number;
    totalAspirants: number;
    totalVoters: number;
    verifiedUsers: number;
    activeUsers: number;
}
