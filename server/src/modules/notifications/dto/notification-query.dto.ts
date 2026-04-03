import { IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class NotificationQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
