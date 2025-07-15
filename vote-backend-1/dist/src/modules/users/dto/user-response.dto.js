"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileResponseDto = exports.UserResponseDto = void 0;
class UserResponseDto {
    id;
    name;
    phone;
    email;
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
    inkVerified;
    inkVerifiedAt;
    createdAt;
    updatedAt;
}
exports.UserResponseDto = UserResponseDto;
class UserProfileResponseDto {
    id;
    name;
    phone;
    role;
    phoneVerified;
    isActive;
    createdAt;
    lastLoginAt;
}
exports.UserProfileResponseDto = UserProfileResponseDto;
//# sourceMappingURL=user-response.dto.js.map