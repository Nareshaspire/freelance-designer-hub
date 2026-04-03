import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum ConversationType {
  DIRECT = 'direct',
  PROJECT_GROUP = 'project_group',
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ConversationType, default: ConversationType.DIRECT })
  type: ConversationType;

  @Column({ nullable: true })
  projectId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'simple-array', nullable: true })
  participantIds: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
