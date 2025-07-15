import { Test, TestingModule } from '@nestjs/testing';
import {NotificationTestController } from './notifications.controller';
import { NotificationService } from './notification.service';

describe('NotificationsController', () => {
  let controller: NotificationTestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationTestController],
      providers: [NotificationService],
    }).compile();

    controller = module.get<NotificationTestController>(NotificationTestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
