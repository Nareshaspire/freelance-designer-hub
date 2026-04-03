import { PartialType } from '@nestjs/common';
import { CreateMilestoneDto } from './create-milestone.dto';

export class UpdateMilestoneDto extends PartialType(CreateMilestoneDto) {}
