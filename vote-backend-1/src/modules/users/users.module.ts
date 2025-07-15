import {forwardRef, Module} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {DbModule, PrismaService} from "../../../db";
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [forwardRef(() => AuthModule), DbModule],
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
