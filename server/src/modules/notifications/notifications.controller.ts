import { Controller, Get, Patch, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  listNotifications(@Request() req: any, @Query() query: NotificationQueryDto) {
    return this.notificationsService.listNotifications(req.user.id, query);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }

  @Post('read-all')
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
