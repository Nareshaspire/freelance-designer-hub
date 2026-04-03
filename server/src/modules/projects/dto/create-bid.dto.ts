import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsArray,
  IsUrl,
} from 'class-validator';

export class CreateBidDto {
  @IsNumber()
  @IsPositive()
  proposedRate: number;

  @IsString()
  @IsNotEmpty()
  estimatedDuration: string;

  @IsString()
  @IsNotEmpty()
  coverLetter: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  portfolioSamples?: string[];
}
