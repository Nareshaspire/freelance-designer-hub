import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum EscrowStatus {
  FUNDED = 'funded',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

@Entity('escrows')
export class Escrow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  projectId: string;

  @Column('uuid', { nullable: true })
  milestoneId: string;

  @Column('uuid')
  clientId: string;

  @Column('uuid')
  freelancerId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: EscrowStatus,
    default: EscrowStatus.FUNDED,
  })
  status: EscrowStatus;

  @Column({ type: 'timestamp' })
  fundedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  releasedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
