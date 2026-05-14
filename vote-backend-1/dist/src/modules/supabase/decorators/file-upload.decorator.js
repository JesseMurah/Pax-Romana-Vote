"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiFileUpload = ApiFileUpload;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
function ApiFileUpload(fieldName = 'file') {
    return (0, common_1.applyDecorators)((0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)(fieldName)), (0, swagger_1.ApiConsumes)('multipart/form-data'), (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                [fieldName]: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }));
}
//# sourceMappingURL=file-upload.decorator.js.map