import { ArgumentsHost, ExceptionFilter, HttpException } from "@nestjs/common";
export declare class NominationExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void;
}
