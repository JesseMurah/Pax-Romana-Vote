import { Module } from '@nestjs/common';
import { NominationService } from './services/nomination.service';
import { NominationsController } from './controllers/nomination-submission.controller';
import {DbModule, PrismaService} from '../../../db';
import { DeadlineService } from '../common/utils/deadline.service';
import { NotificationsModule } from "../notifications/notifications.module";
import {UsersService} from "../users/users.service";
import {NominationController} from "./nominations.controller";
import {FileUploadModule} from "../file-upload/file-upload.module";

@Module({
    imports: [DbModule, NotificationsModule, FileUploadModule],
    controllers: [NominationsController],
    providers: [NominationService, DeadlineService, PrismaService, UsersService],
    exports: [NominationService],
})
export class NominationModule {
    constructor() {
        console.log('NominationsModule dependencies:', { DbModule: !!DbModule });
    }
}