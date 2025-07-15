import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { ImageValidationService } from "../services/image-validation.service";
import { Observable } from "rxjs";
export declare class FileValidationInterceptor implements NestInterceptor {
    private imageValidationService;
    constructor(imageValidationService: ImageValidationService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
