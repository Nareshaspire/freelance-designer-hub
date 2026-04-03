import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VideoService } from './video.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Calls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calls')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Get('history')
  getCallHistory(@Request() req: any) {
    return this.videoService.getCallHistory(req.user.id);
  }

  @Get(':id')
  getCallSession(@Request() req: any, @Param('id') id: string) {
    return this.videoService.getCallSession(req.user.id, id);
  }
}
