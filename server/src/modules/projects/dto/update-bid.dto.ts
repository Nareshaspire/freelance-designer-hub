import { PartialType } from '@nestjs/common';
import { CreateBidDto } from './create-bid.dto';

export class UpdateBidDto extends PartialType(CreateBidDto) {}
