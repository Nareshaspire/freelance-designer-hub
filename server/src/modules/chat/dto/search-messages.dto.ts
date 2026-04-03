import { IsOptional, IsString } from 'class-validator';

export class SearchMessagesDto {
  @IsString()
  q: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}
