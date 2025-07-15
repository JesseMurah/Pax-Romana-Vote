"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseDto = void 0;
class ApiResponseDto {
    success;
    message;
    data;
    errors;
    timestamp;
    pagination;
    constructor(success, message, data, errors) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
        this.timestamp = new Date().toISOString();
    }
}
exports.ApiResponseDto = ApiResponseDto;
//# sourceMappingURL=api-response.dto.js.map