import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageType } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { SearchMessagesDto } from './dto/search-messages.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async createConversation(userId: string, dto: CreateConversationDto): Promise<Conversation> {
    const participantIds = [...new Set([userId, ...dto.participantIds])];
    const conversation = this.conversationRepo.create({
      type: dto.type,
      projectId: dto.projectId,
      name: dto.name,
      participantIds,
    });
    return this.conversationRepo.save(conversation);
  }

  async listConversations(userId: string): Promise<any[]> {
    const conversations = await this.conversationRepo
      .createQueryBuilder('c')
      .where(':userId = ANY(string_to_array(c.participantIds, \',\'))', { userId })
      .orderBy('c.lastMessageAt', 'DESC', 'NULLS LAST')
      .getMany();

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await this.messageRepo.findOne({
          where: { conversationId: conv.id, deletedAt: IsNull() },
          order: { createdAt: 'DESC' },
        });
        const unreadCount = await this.messageRepo
          .createQueryBuilder('m')
          .where('m.conversationId = :conversationId', { conversationId: conv.id })
          .andWhere('m.deletedAt IS NULL')
          .andWhere("m.readBy NOT LIKE :pattern", { pattern: `%"userId":"${userId}"%` })
          .getCount();
        return { ...conv, lastMessage, unreadCount };
      }),
    );
    return result;
  }

  async getConversation(userId: string, conversationId: string): Promise<Conversation> {
    const conv = await this.conversationRepo.findOne({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (!conv.participantIds?.includes(userId)) throw new ForbiddenException();
    return conv;
  }

  async leaveConversation(userId: string, conversationId: string): Promise<void> {
    const conv = await this.getConversation(userId, conversationId);
    conv.participantIds = conv.participantIds.filter((id) => id !== userId);
    if (conv.participantIds.length === 0) {
      await this.conversationRepo.remove(conv);
    } else {
      await this.conversationRepo.save(conv);
    }
  }

  async getMessages(userId: string, conversationId: string, query: MessageQueryDto): Promise<Message[]> {
    await this.getConversation(userId, conversationId);
    const limit = query.limit || 50;
    const qb = this.messageRepo
      .createQueryBuilder('m')
      .where('m.conversationId = :conversationId', { conversationId })
      .andWhere('m.deletedAt IS NULL')
      .orderBy('m.createdAt', 'DESC')
      .take(limit);

    if (query.cursor) {
      qb.andWhere('m.createdAt < :cursor', { cursor: new Date(query.cursor) });
    }
    const messages = await qb.getMany();
    return messages.reverse();
  }

  async sendMessage(userId: string, conversationId: string, dto: SendMessageDto): Promise<Message> {
    await this.getConversation(userId, conversationId);
    const message = this.messageRepo.create({
      conversationId,
      senderId: userId,
      content: dto.content,
      type: dto.type || MessageType.TEXT,
      fileUrl: dto.fileUrl,
      fileName: dto.fileName,
      fileSize: dto.fileSize,
      replyToId: dto.replyToId,
      mentions: dto.mentions || [],
      readBy: [{ userId, readAt: new Date().toISOString() }],
    });
    const saved = await this.messageRepo.save(message);
    await this.conversationRepo.update(conversationId, { lastMessageAt: new Date() });
    return saved;
  }

  async editMessage(userId: string, messageId: string, dto: EditMessageDto): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) throw new ForbiddenException();
    message.content = dto.content;
    message.isEdited = true;
    message.editedAt = new Date();
    return this.messageRepo.save(message);
  }

  async deleteMessage(userId: string, messageId: string): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) throw new ForbiddenException();
    message.deletedAt = new Date();
    return this.messageRepo.save(message);
  }

  async pinMessage(userId: string, messageId: string): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    await this.getConversation(userId, message.conversationId);
    message.isPinned = !message.isPinned;
    return this.messageRepo.save(message);
  }

  async markMessageRead(userId: string, messageId: string): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    const readBy = message.readBy || [];
    const alreadyRead = readBy.some((r) => r.userId === userId);
    if (!alreadyRead) {
      readBy.push({ userId, readAt: new Date().toISOString() });
      message.readBy = readBy;
      return this.messageRepo.save(message);
    }
    return message;
  }

  async searchMessages(userId: string, dto: SearchMessagesDto): Promise<Message[]> {
    const qb = this.messageRepo
      .createQueryBuilder('m')
      .where('m.content ILIKE :q', { q: `%${dto.q}%` })
      .andWhere('m.deletedAt IS NULL')
      .orderBy('m.createdAt', 'DESC')
      .take(50);

    if (dto.conversationId) {
      qb.andWhere('m.conversationId = :conversationId', { conversationId: dto.conversationId });
    }
    return qb.getMany();
  }

  async uploadFile(userId: string, conversationId: string, file: Express.Multer.File): Promise<Message> {
    await this.getConversation(userId, conversationId);
    const isImage = file.mimetype.startsWith('image/');
    const fileUrl = `/uploads/${file.filename}`;
    return this.sendMessage(userId, conversationId, {
      content: file.originalname,
      type: isImage ? MessageType.IMAGE : MessageType.FILE,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
    });
  }

  async getPinnedMessages(userId: string, conversationId: string): Promise<Message[]> {
    await this.getConversation(userId, conversationId);
    return this.messageRepo.find({
      where: { conversationId, isPinned: true, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }
}
