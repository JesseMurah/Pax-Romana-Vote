import { UserRoles } from '../enums/user-roles.enum';
export interface IUser {
    id: string;
    name: string;
    phone: string;
    email?: string;
    password?: string;
    role: UserRoles;
    phoneVerified: boolean;
    phoneVerifiedAt?: Date;
    emailVerified: boolean;
    emailVerifiedAt?: Date;
    programme?: string;
    level?: string;
    subgroup?: string;
    college?: string;
    lastLoginAt?: Date | null;
    isActive: boolean;
    hasVoted: boolean;
    votedAt?: Date | null;
    voterHash?: string;
    inkVerified: boolean;
    inkVerifiedAt?: Date | null;
    inkVerifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserProfile {
    id: string;
    name: string;
    phone: string | null;
    role: UserRoles;
    phoneVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    lastLoginAt?: Date | null;
}
