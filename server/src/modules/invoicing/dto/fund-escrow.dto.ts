import { IsUUID, IsOptional, IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FundEscrowDto {
  @ApiProperty({ description: 'Project UUID' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ description: 'Milestone UUID' })
  @IsOptional()
  @IsUUID()
  milestoneId?: string;

  @ApiProperty({ description: 'Escrow amount' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @ApiProperty({ description: 'Freelancer UUID' })
  @IsUUID()
  freelancerId: string;

  @ApiProperty({ description: 'Client UUID' })
  @IsUUID()
  clientId: string;
}
