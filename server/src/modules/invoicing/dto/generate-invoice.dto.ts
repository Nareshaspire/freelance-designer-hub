import { IsUUID, IsOptional, IsArray, IsBoolean, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateInvoiceDto {
  @ApiProperty({ description: 'Project UUID' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ type: [String], description: 'Milestone UUIDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  milestoneIds?: string[];

  @ApiPropertyOptional({ description: 'Include tracked time in invoice' })
  @IsOptional()
  @IsBoolean()
  includeTrackedTime?: boolean;
}
