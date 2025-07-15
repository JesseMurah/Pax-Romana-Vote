"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const user_roles_enum_1 = require("../enums/user-roles.enum");
class User {
    id;
    name;
    phone;
    email;
    password;
    role;
    phoneVerified;
    phoneVerifiedAt;
    emailVerified;
    emailVerifiedAt;
    programme;
    level;
    subgroup;
    college;
    lastLoginAt;
    isActive;
    hasVoted;
    votedAt;
    voterHash;
    inkVerified;
    inkVerifiedAt;
    inkVerifiedBy;
    createdAt;
    updatedAt;
    constructor(partial) {
        Object.assign(this, partial);
    }
    isAdmin() {
        return this.role === user_roles_enum_1.UserRoles.SUPER_ADMIN || this.role === user_roles_enum_1.UserRoles.EC_MEMBER || this.role === user_roles_enum_1.UserRoles.ADMIN;
    }
    isSuperAdmin() {
        return this.role === user_roles_enum_1.UserRoles.SUPER_ADMIN;
    }
    isECMember() {
        return this.role === user_roles_enum_1.UserRoles.EC_MEMBER;
    }
    isAspirant() {
        return this.role === user_roles_enum_1.UserRoles.ASPIRANT;
    }
    isVoter() {
        return this.role === user_roles_enum_1.UserRoles.VOTER;
    }
    canNominate() {
        return this.phoneVerified && this.isActive;
    }
    canVote() {
        return this.phoneVerified && this.isActive && this.role === user_roles_enum_1.UserRoles.VOTER;
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map