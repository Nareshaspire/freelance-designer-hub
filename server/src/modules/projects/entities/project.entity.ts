import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Bid } from './bid.entity';
import { Milestone } from './milestone.entity';
import { Task } from './task.entity';

export enum BudgetType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  DISPUTED = 'disputed',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  budget: number;

  @Column({ type: 'enum', enum: BudgetType })
  budgetType: BudgetType;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.DRAFT })
  status: ProjectStatus;

  @Column({ nullable: true })
  category: string;

  @Column('simple-array', { nullable: true })
  requiredSkills: string[];

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column('json', { nullable: true })
  attachments: string[];

  @Column()
  clientId: string;

  @Column({ nullable: true })
  freelancerId: string;

  @OneToMany(() => Bid, (bid) => bid.project)
  bids: Bid[];

  @OneToMany(() => Milestone, (milestone) => milestone.project)
  milestones: Milestone[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
