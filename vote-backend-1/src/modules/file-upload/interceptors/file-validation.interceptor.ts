import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { ImageValidationService } from "../services/image-validation.service";
import { Observable } from "rxjs";

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
    constructor(private imageValidationService: ImageValidationService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const file = request.file;

        if (file) {
            this.imageValidationService.validateFile(file);
        }

        return next.handle();
    }
}