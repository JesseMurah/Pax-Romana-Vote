import { UserRoles } from '../enums/user-roles.enum';
export declare class UserResponseDto {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: UserRoles;
    phoneVerified: boolean;
    phoneVerifiedAt?: Date;
    emailVerified: boolean;
    emailVerifiedAt?: Date;
    programme?: string;
    level?: string;
    subgroup?: string;
    college?: string;
    lastLoginAt?: Date;
    isActive: boolean;
    hasVoted: boolean;
    votedAt?: Date;
    inkVerified: boolean;
    inkVerifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UserProfileResponseDto {
    id: string;
    name: string;
    phone: string;
    role: UserRoles;
    phoneVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    lastLoginAt?: Date;
}
