import { UserRoles } from "../enums/user-roles.enum";
import {UserRole} from "@prisma/client/index";

export class User {
    id: string;
    name: string;
    phone: string; // Changed from phoneNumber to match schema
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
    lastLoginAt?: Date; // Changed from lastLogin to match schema
    isActive: boolean;
    hasVoted: boolean;
    votedAt?: Date;
    voterHash?: string;
    inkVerified: boolean;
    inkVerifiedAt?: Date;
    inkVerifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: {
        college: string | null;
        createdAt: Date;
        email: string;
        emailVerified: boolean;
        id: string;
        isActive: boolean;
        level: string | null;
        name: string;
        phone: string | null;
        phoneVerified: boolean;
        role: UserRole;
        subgroup: string | null;
        subgroupId: string | null;
        updatedAt: Date
    }) {
        Object.assign(this, partial);
    }

    // Helper methods
    isAdmin(): boolean {
        return this.role === UserRoles.SUPER_ADMIN || this.role === UserRoles.EC_MEMBER || this.role === UserRoles.ADMIN;
    }

    isSuperAdmin(): boolean {
        return this.role === UserRoles.SUPER_ADMIN;
    }

    isECMember(): boolean {
        return this.role === UserRoles.EC_MEMBER;
    }

    isAspirant(): boolean {
        return this.role === UserRoles.ASPIRANT;
    }

    isVoter(): boolean {
        return this.role === UserRoles.VOTER;
    }

    canNominate(): boolean {
        return this.phoneVerified && this.isActive; // Using phoneVerified instead of isVerified
    }

    canVote(): boolean {
        return this.phoneVerified && this.isActive && this.role === UserRoles.VOTER;
    }
}