import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiBody } from '@nestjs/swagger'

export function ApiFileUpload(fieldName: string = 'file') {
    return applyDecorators(
        UseInterceptors(FileInterceptor(fieldName)),
        ApiConsumes('multipart/form-data'),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    [fieldName]: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        }),
    );
}