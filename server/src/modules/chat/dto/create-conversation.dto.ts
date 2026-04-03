import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { ConversationType } from '../entities/conversation.entity';

export class CreateConversationDto {
  @IsEnum(ConversationType)
  type: ConversationType;

  @IsArray()
  @IsString({ each: true })
  participantIds: string[];

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
