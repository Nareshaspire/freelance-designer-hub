import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { EscrowService } from '../services/escrow.service';
import { FundEscrowDto } from '../dto/fund-escrow.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('escrow')
@ApiHeader({ name: 'x-user-id', description: 'User ID (temporary auth header)', required: true })
@UseGuards(AuthGuard)
@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('fund')
  @ApiOperation({ summary: 'Fund an escrow account for a project/milestone' })
  fundEscrow(@Body() dto: FundEscrowDto) {
    return this.escrowService.fundEscrow(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List escrow transactions for user' })
  findAll(@Headers('x-user-id') userId: string) {
    return this.escrowService.findAll(userId);
  }

  @Post(':id/release')
  @ApiOperation({ summary: 'Release escrow funds to freelancer' })
  releaseEscrow(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.escrowService.releaseEscrow(id, userId);
  }

  @Post(':id/dispute')
  @ApiOperation({ summary: 'Dispute an escrow transaction' })
  disputeEscrow(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.escrowService.disputeEscrow(id, userId);
  }
}
