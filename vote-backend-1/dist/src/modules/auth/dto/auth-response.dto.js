"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationSuccessResponseDto = exports.VerificationDetailsResponseDto = exports.VerificationResponseDto = exports.AuthResponseDto = void 0;
class AuthResponseDto {
    access_token;
    refresh_token;
    user;
}
exports.AuthResponseDto = AuthResponseDto;
class VerificationResponseDto {
    verificationToken;
    action;
    reason;
}
exports.VerificationResponseDto = VerificationResponseDto;
class VerificationDetailsResponseDto {
    nomination;
    guarantorName;
    guarantorEmail;
    tokenType;
    isExpired;
    isAlreadyVerified;
    verificationStatus;
}
exports.VerificationDetailsResponseDto = VerificationDetailsResponseDto;
class VerificationSuccessResponseDto {
    message;
    success;
    timeRemaining;
    nominationId;
    expiresAt;
}
exports.VerificationSuccessResponseDto = VerificationSuccessResponseDto;
//# sourceMappingURL=auth-response.dto.js.map