import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { UpdateBidDto } from './dto/update-bid.dto';

// TODO: Add AuthGuard once auth module is implemented
@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Get('my')
  getMyBids(@Req() req: any) {
    const freelancerId: string = req.user?.id || 'test-user';
    return this.bidsService.findMyBids(freelancerId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateBidDto,
  ) {
    const freelancerId: string = req.user?.id || 'test-user';
    return this.bidsService.update(id, freelancerId, dto);
  }

  @Delete(':id')
  withdraw(@Param('id') id: string, @Req() req: any) {
    const freelancerId: string = req.user?.id || 'test-user';
    return this.bidsService.withdraw(id, freelancerId);
  }

  @Post(':id/accept')
  accept(@Param('id') id: string, @Req() req: any) {
    const clientId: string = req.user?.id || 'test-user';
    return this.bidsService.accept(id, clientId);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Req() req: any) {
    const clientId: string = req.user?.id || 'test-user';
    return this.bidsService.reject(id, clientId);
  }
}
