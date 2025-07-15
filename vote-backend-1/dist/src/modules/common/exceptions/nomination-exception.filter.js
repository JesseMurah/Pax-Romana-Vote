"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NominationExceptionFilter = void 0;
class NominationExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        const errorResponse = {
            success: false,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            status,
            message: typeof exceptionResponse === 'string' ? exceptionResponse : exceptionResponse.message,
            errors: typeof exceptionResponse === 'object' && exceptionResponse.message ? [exceptionResponse.message] : [],
        };
        response.status(status).json(errorResponse);
    }
}
exports.NominationExceptionFilter = NominationExceptionFilter;
//# sourceMappingURL=nomination-exception.filter.js.map