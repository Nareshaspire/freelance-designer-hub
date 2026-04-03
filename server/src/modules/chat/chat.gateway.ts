import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from './entities/notification.entity';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private userSocketMap = new Map<string, string>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      this.userSocketMap.set(payload.sub, client.id);
      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.userSocketMap.delete(client.data.userId);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    client.join(`conversation:${data.conversationId}`);
    return { status: 'joined', conversationId: data.conversationId };
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    client.leave(`conversation:${data.conversationId}`);
    return { status: 'left', conversationId: data.conversationId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const userId = client.data.userId;
    if (!userId) return { error: 'Unauthorized' };
    try {
      const message = await this.chatService.sendMessage(userId, data.conversationId, data);
      this.server.to(`conversation:${data.conversationId}`).emit('new_message', message);
      return message;
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    const userId = client.data.userId;
    client.to(`conversation:${data.conversationId}`).emit('user_typing', { userId, conversationId: data.conversationId });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    const userId = client.data.userId;
    client.to(`conversation:${data.conversationId}`).emit('user_stopped_typing', { userId, conversationId: data.conversationId });
  }

  @SubscribeMessage('message_read')
  async handleMessageRead(@ConnectedSocket() client: Socket, @MessageBody() data: { messageId: string; conversationId: string }) {
    const userId = client.data.userId;
    if (!userId) return { error: 'Unauthorized' };
    try {
      const message = await this.chatService.markMessageRead(userId, data.messageId);
      this.server.to(`conversation:${data.conversationId}`).emit('message_read_receipt', { messageId: data.messageId, userId, readAt: new Date() });
      return message;
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('edit_message')
  async handleEditMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { messageId: string; content: string; conversationId: string }) {
    const userId = client.data.userId;
    if (!userId) return { error: 'Unauthorized' };
    try {
      const message = await this.chatService.editMessage(userId, data.messageId, { content: data.content });
      this.server.to(`conversation:${data.conversationId}`).emit('message_updated', message);
      return message;
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { messageId: string; conversationId: string }) {
    const userId = client.data.userId;
    if (!userId) return { error: 'Unauthorized' };
    try {
      const message = await this.chatService.deleteMessage(userId, data.messageId);
      this.server.to(`conversation:${data.conversationId}`).emit('message_deleted', { messageId: data.messageId });
      return message;
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('pin_message')
  async handlePinMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { messageId: string; conversationId: string }) {
    const userId = client.data.userId;
    if (!userId) return { error: 'Unauthorized' };
    try {
      const message = await this.chatService.pinMessage(userId, data.messageId);
      this.server.to(`conversation:${data.conversationId}`).emit('message_pinned', message);
      return message;
    } catch (error) {
      return { error: error.message };
    }
  }

  sendNotificationToUser(userId: string, notification: Record<string, unknown>) {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }
}
