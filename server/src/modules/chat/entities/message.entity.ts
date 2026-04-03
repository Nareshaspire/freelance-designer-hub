import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  IMAGE = 'image',
  SYSTEM = 'system',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column()
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ type: 'integer', nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  replyToId: string;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'replyToId' })
  replyTo: Message;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ type: 'simple-json', nullable: true })
  mentions: string[];

  @Column({ type: 'simple-json', nullable: true })
  readBy: { userId: string; readAt: string }[];

  @Column({ default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
