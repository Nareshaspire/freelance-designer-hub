import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsDateString,
  IsInt,
} from 'class-validator';

export class CreateMilestoneDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  dueDate: Date;

  @IsNumber()
  @IsInt()
  order: number;
}
