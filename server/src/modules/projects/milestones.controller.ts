import { Controller, Patch, Post, Body, Param, Req } from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';

// TODO: Add AuthGuard once auth module is implemented
@Controller('milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateMilestoneDto,
  ) {
    const userId: string = req.user?.id || 'test-user';
    return this.milestonesService.update(id, userId, dto);
  }

  @Post(':id/submit')
  submit(
    @Param('id') id: string,
    @Req() req: any,
    @Body('deliverableUrl') deliverableUrl: string,
  ) {
    const freelancerId: string = req.user?.id || 'test-user';
    return this.milestonesService.submit(id, freelancerId, deliverableUrl);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Req() req: any) {
    const clientId: string = req.user?.id || 'test-user';
    return this.milestonesService.approve(id, clientId);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Req() req: any) {
    const clientId: string = req.user?.id || 'test-user';
    return this.milestonesService.reject(id, clientId);
  }
}
