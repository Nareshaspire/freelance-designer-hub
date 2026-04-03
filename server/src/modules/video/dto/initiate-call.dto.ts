import { IsEnum, IsString } from 'class-validator';
import { CallType } from '../entities/call-session.entity';

export class InitiateCallDto {
  @IsString()
  conversationId: string;

  @IsEnum(CallType)
  type: CallType;
}
