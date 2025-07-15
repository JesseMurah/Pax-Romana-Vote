import {
    BadRequestException,
    Body,
    Controller,
    Delete, Get,
    Param,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { FileUploadService } from "./services/file-upload.service";
import {Roles} from "../auth/decorators/roles.decorator";
import {UserRoles} from "../users/enums/user-roles.enum";
import {FileInterceptor} from "@nestjs/platform-express";
import {CandidatePhotoDto, UploadResponseDto} from "./dto/upload-response.dto";
import { FileValidationInterceptor } from "./interceptors/file-validation.interceptor";


@Controller('file-upload')
@UseGuards(JwtAuthGuard)
export class FileUploadController {
    constructor(private fileUploadService: FileUploadService) {}

    @Post('candidate-photo')
    @Roles(UserRoles.ASPIRANT, UserRoles.SUPER_ADMIN, UserRoles.EC_MEMBER)
    @UseInterceptors(FileInterceptor('photo'), FileValidationInterceptor)
    async uploadCandidatePhoto(
        @UploadedFile() file: Express.Multer.File,
        @Body() candidatePhotoDto: CandidatePhotoDto,
    ): Promise<UploadResponseDto> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        return await this.fileUploadService.uploadCandidatePhoto(file, candidatePhotoDto);
    }

    @Post('nomination-document/:nominationId')
    @Roles(UserRoles.ASPIRANT, UserRoles.SUPER_ADMIN, UserRoles.EC_MEMBER)
    @UseInterceptors(FileInterceptor('document'))
    async uploadNominationDocument(
        @UploadedFile() file: Express.Multer.File,
        @Param('nominationId') nominationId: string,
    ): Promise<UploadResponseDto> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        return await this.fileUploadService.uploadNominationDocument(file, nominationId);
    }

    @Delete(':publicId')
    @Roles(UserRoles.SUPER_ADMIN, UserRoles.EC_MEMBER)
    async deleteFile(@Param('publicId') publicId: string): Promise<{ message: string }> {
        await this.fileUploadService.deleteFile(publicId);
        return { message: 'File deleted successfully' };
    }

    @Get('info/:publicId')
    @Roles(UserRoles.SUPER_ADMIN, UserRoles.EC_MEMBER)
    async getFileInfo(@Param('publicId') publicId: string) {
        return await this.fileUploadService.getFileInfo(publicId);
    }

    @Get('urls/:publicId')
    async getPhotoUrls(@Param('publicId') publicId: string) {
        return this.fileUploadService.generatePhotoUrls(publicId);
    }

}