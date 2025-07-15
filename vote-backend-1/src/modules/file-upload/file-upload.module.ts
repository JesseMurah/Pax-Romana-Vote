import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from './services/file-upload.service';
import { CloudinaryService } from "./services/cloudinary.service";
import { ImageValidationService } from "./services/image-validation.service";
import { PhotoProcessingService } from "./services/photo-processing.service";
import { FileUploadController } from './file-upload.controller';

@Module({
    imports: [ConfigModule],
    controllers: [FileUploadController],
    providers: [
        FileUploadService,
        CloudinaryService,
        ImageValidationService,
        PhotoProcessingService,
    ],
    exports: [
        FileUploadService,
        CloudinaryService,
        ImageValidationService,
        PhotoProcessingService,
    ],
})
export class FileUploadModule {}