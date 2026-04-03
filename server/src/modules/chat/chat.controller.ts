import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { SearchMessagesDto } from './dto/search-messages.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('conversations')
  createConversation(@Request() req: any, @Body() dto: CreateConversationDto) {
    return this.chatService.createConversation(req.user.id, dto);
  }

  @Get('conversations')
  listConversations(@Request() req: any) {
    return this.chatService.listConversations(req.user.id);
  }

  @Get('conversations/:id')
  getConversation(@Request() req: any, @Param('id') id: string) {
    return this.chatService.getConversation(req.user.id, id);
  }

  @Delete('conversations/:id')
  leaveConversation(@Request() req: any, @Param('id') id: string) {
    return this.chatService.leaveConversation(req.user.id, id);
  }

  @Get('conversations/:id/messages')
  getMessages(@Request() req: any, @Param('id') id: string, @Query() query: MessageQueryDto) {
    return this.chatService.getMessages(req.user.id, id, query);
  }

  @Post('conversations/:id/messages')
  sendMessage(@Request() req: any, @Param('id') id: string, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.id, id, dto);
  }

  @Get('messages/search')
  searchMessages(@Request() req: any, @Query() query: SearchMessagesDto) {
    return this.chatService.searchMessages(req.user.id, query);
  }

  @Post('conversations/:id/messages/:messageId/pin')
  pinMessage(@Request() req: any, @Param('messageId') messageId: string) {
    return this.chatService.pinMessage(req.user.id, messageId);
  }

  @Get('conversations/:id/pinned')
  getPinnedMessages(@Request() req: any, @Param('id') id: string) {
    return this.chatService.getPinnedMessages(req.user.id, id);
  }

  @Post('conversations/:id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
      fileFilter: (req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|mp4|mov)$/i;
        if (allowed.test(extname(file.originalname))) {
          cb(null, true);
        } else {
          cb(new Error('File type not allowed'), false);
        }
      },
    }),
  )
  uploadFile(@Request() req: any, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.chatService.uploadFile(req.user.id, id, file);
  }
}
