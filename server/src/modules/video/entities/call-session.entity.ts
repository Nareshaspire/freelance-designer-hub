import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Conversation } from '../../chat/entities/conversation.entity';

export enum CallType {
  AUDIO = 'audio',
  VIDEO = 'video',
}

export enum CallStatus {
  RINGING = 'ringing',
  ACTIVE = 'active',
  ENDED = 'ended',
  MISSED = 'missed',
  REJECTED = 'rejected',
}

@Entity('call_sessions')
export class CallSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column()
  initiatorId: string;

  @Column({ type: 'enum', enum: CallType })
  type: CallType;

  @Column({ type: 'enum', enum: CallStatus, default: CallStatus.RINGING })
  status: CallStatus;

  @Column({ type: 'simple-json', nullable: true })
  participants: { userId: string; joinedAt: string; leftAt?: string }[];

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ type: 'integer', default: 0 })
  duration: number;

  @CreateDateColumn()
  createdAt: Date;
}
