import {
  IsUUID,
  IsArray,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsDateString,
  ValidateNested,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceItemDto } from './invoice-item.dto';

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Project UUID' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ description: 'Client UUID' })
  @IsUUID()
  clientId: string;

  @ApiPropertyOptional({ description: 'Milestone UUID' })
  @IsOptional()
  @IsUUID()
  milestoneId?: string;

  @ApiProperty({ type: [InvoiceItemDto], description: 'Invoice line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @ApiProperty({ description: 'Due date (ISO string)' })
  @IsDateString()
  dueDate: Date;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Tax rate percentage (0-100)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number = 0;

  @ApiPropertyOptional({ description: 'Discount amount', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number = 0;
}
