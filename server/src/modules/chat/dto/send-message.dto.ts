import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  fileSize?: number;

  @IsOptional()
  @IsString()
  replyToId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];
}
