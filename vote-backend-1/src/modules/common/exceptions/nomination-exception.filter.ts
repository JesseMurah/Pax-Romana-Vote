import {ArgumentsHost, ExceptionFilter, HttpException} from "@nestjs/common";


export class NominationExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        const errorResponse = {
            success: false,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            status,
            message: typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message,
            errors: typeof exceptionResponse === 'object' && (exceptionResponse as any).message ? [(exceptionResponse as any).message] : [],
        };


        // @ts-ignore
        response.status(status).json(errorResponse);
    }
}