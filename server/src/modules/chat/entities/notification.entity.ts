import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  MENTION = 'mention',
  PROJECT_UPDATE = 'project_update',
  BID_RECEIVED = 'bid_received',
  BID_ACCEPTED = 'bid_accepted',
  PAYMENT_RECEIVED = 'payment_received',
  MILESTONE_APPROVED = 'milestone_approved',
  REVIEW_RECEIVED = 'review_received',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column()
  link: string;

  @Column({ nullable: true })
  relatedEntityId: string;

  @Column({ nullable: true })
  relatedEntityType: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
