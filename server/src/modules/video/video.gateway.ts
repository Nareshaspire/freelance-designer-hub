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
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InitiateCallDto } from './dto/initiate-call.dto';

interface CallInitiatePayload extends InitiateCallDto {
  recipientId: string;
  sdp?: RTCSessionDescriptionInit;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/video' })
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('VideoGateway');
  private userSocketMap = new Map<string, string>();

  constructor(
    private videoService: VideoService,
    private jwtService: JwtService,
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
      this.logger.log(`Video client connected: ${client.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.userSocketMap.delete(client.data.userId);
    }
    this.logger.log(`Video client disconnected: ${client.id}`);
  }

  @SubscribeMessage('call_initiate')
  async handleCallInitiate(@ConnectedSocket() client: Socket, @MessageBody() data: CallInitiatePayload) {
    const userId = client.data.userId;
    if (!userId) return { error: 'Unauthorized' };
    try {
      const session = await this.videoService.initiateCall(userId, data);
      // Notify all participants in conversation
      const recipientSocketId = this.userSocketMap.get(data.recipientId);
      if (recipientSocketId) {
        this.server.to(recipientSocketId).emit('incoming_call', {
          sessionId: session.id,
          callerId: userId,
          type: data.type,
          conversationId: data.conversationId,
        });
      }
      return { sessionId: session.id };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('call_answer')
  async handleCallAnswer(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string; sdp: any }) {
    const userId = client.data.userId;
    if (!userId) return { error: 'Unauthorized' };
    try {
      const session = await this.videoService.answerCall(userId, data.sessionId);
      const callerSocketId = this.userSocketMap.get(session.initiatorId);
      if (callerSocketId) {
        this.server.to(callerSocketId).emit('call_answered', { sessionId: data.sessionId, sdp: data.sdp, answererId: userId });
      }
      return { status: 'answered' };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('call_reject')
  async handleCallReject(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string }) {
    const userId = client.data.userId;
    if (!userId) return { error: 'Unauthorized' };
    try {
      const session = await this.videoService.rejectCall(userId, data.sessionId);
      const callerSocketId = this.userSocketMap.get(session.initiatorId);
      if (callerSocketId) {
        this.server.to(callerSocketId).emit('call_rejected', { sessionId: data.sessionId, rejecterId: userId });
      }
      return { status: 'rejected' };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('call_end')
  async handleCallEnd(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string }) {
    const userId = client.data.userId;
    if (!userId) return { error: 'Unauthorized' };
    try {
      const session = await this.videoService.endCall(userId, data.sessionId);
      // Notify all participants
      (session.participants || []).forEach((p) => {
        const socketId = this.userSocketMap.get(p.userId);
        if (socketId && p.userId !== userId) {
          this.server.to(socketId).emit('call_ended', { sessionId: data.sessionId, endedBy: userId });
        }
      });
      return { status: 'ended' };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('ice_candidate')
  handleIceCandidate(@ConnectedSocket() client: Socket, @MessageBody() data: { targetUserId: string; candidate: any; sessionId: string }) {
    const targetSocketId = this.userSocketMap.get(data.targetUserId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('remote_ice_candidate', {
        candidate: data.candidate,
        sessionId: data.sessionId,
        fromUserId: client.data.userId,
      });
    }
  }

  @SubscribeMessage('toggle_audio')
  handleToggleAudio(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string; enabled: boolean; targetUserId: string }) {
    const targetSocketId = this.userSocketMap.get(data.targetUserId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('participant_toggled_audio', {
        userId: client.data.userId,
        enabled: data.enabled,
        sessionId: data.sessionId,
      });
    }
  }

  @SubscribeMessage('toggle_video')
  handleToggleVideo(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string; enabled: boolean; targetUserId: string }) {
    const targetSocketId = this.userSocketMap.get(data.targetUserId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('participant_toggled_video', {
        userId: client.data.userId,
        enabled: data.enabled,
        sessionId: data.sessionId,
      });
    }
  }

  @SubscribeMessage('screen_share_start')
  handleScreenShareStart(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string; targetUserId: string }) {
    const targetSocketId = this.userSocketMap.get(data.targetUserId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('screen_share_started', {
        userId: client.data.userId,
        sessionId: data.sessionId,
      });
    }
  }

  @SubscribeMessage('screen_share_stop')
  handleScreenShareStop(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string; targetUserId: string }) {
    const targetSocketId = this.userSocketMap.get(data.targetUserId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('screen_share_stopped', {
        userId: client.data.userId,
        sessionId: data.sessionId,
      });
    }
  }
}
