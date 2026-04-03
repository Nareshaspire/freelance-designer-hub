import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallSession, CallStatus, CallType } from './entities/call-session.entity';
import { InitiateCallDto } from './dto/initiate-call.dto';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(CallSession)
    private callSessionRepo: Repository<CallSession>,
  ) {}

  async initiateCall(userId: string, dto: InitiateCallDto): Promise<CallSession> {
    const session = this.callSessionRepo.create({
      conversationId: dto.conversationId,
      initiatorId: userId,
      type: dto.type,
      status: CallStatus.RINGING,
      participants: [{ userId, joinedAt: new Date().toISOString() }],
      startedAt: new Date(),
    });
    return this.callSessionRepo.save(session);
  }

  async answerCall(userId: string, sessionId: string): Promise<CallSession> {
    const session = await this.callSessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Call session not found');
    session.status = CallStatus.ACTIVE;
    const participants = session.participants || [];
    if (!participants.find((p) => p.userId === userId)) {
      participants.push({ userId, joinedAt: new Date().toISOString() });
    }
    session.participants = participants;
    return this.callSessionRepo.save(session);
  }

  async endCall(userId: string, sessionId: string): Promise<CallSession> {
    const session = await this.callSessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Call session not found');
    session.status = CallStatus.ENDED;
    session.endedAt = new Date();
    if (session.startedAt) {
      session.duration = Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000);
    }
    const participants = session.participants || [];
    const participant = participants.find((p) => p.userId === userId);
    if (participant) participant.leftAt = new Date().toISOString();
    session.participants = participants;
    return this.callSessionRepo.save(session);
  }

  async rejectCall(userId: string, sessionId: string): Promise<CallSession> {
    const session = await this.callSessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Call session not found');
    session.status = CallStatus.REJECTED;
    session.endedAt = new Date();
    return this.callSessionRepo.save(session);
  }

  async getCallHistory(userId: string): Promise<CallSession[]> {
    return this.callSessionRepo
      .createQueryBuilder('cs')
      .where('cs.initiatorId = :userId', { userId })
      .orWhere("cs.participants::text LIKE :pattern", { pattern: `%"userId":"${userId}"%` })
      .orderBy('cs.createdAt', 'DESC')
      .take(50)
      .getMany();
  }

  async getCallSession(userId: string, id: string): Promise<CallSession> {
    const session = await this.callSessionRepo.findOne({ where: { id } });
    if (!session) throw new NotFoundException('Call session not found');
    const isParticipant =
      session.initiatorId === userId ||
      (session.participants || []).some((p) => p.userId === userId);
    if (!isParticipant) throw new ForbiddenException();
    return session;
  }
}
