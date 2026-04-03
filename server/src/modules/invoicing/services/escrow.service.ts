import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Escrow, EscrowStatus } from '../entities/escrow.entity';
import { FundEscrowDto } from '../dto/fund-escrow.dto';
import { StripeService } from './stripe.service';

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(
    @InjectRepository(Escrow)
    private readonly escrowRepository: Repository<Escrow>,
    private readonly stripeService: StripeService,
  ) {}

  async fundEscrow(dto: FundEscrowDto): Promise<{ escrow: Escrow; clientSecret: string }> {
    const { projectId, milestoneId, amount, currency = 'USD', freelancerId, clientId } = dto;

    const paymentIntent = await this.stripeService.createPaymentIntent(
      amount,
      currency,
      {
        type: 'escrow',
        projectId,
        milestoneId: milestoneId || '',
        clientId,
        freelancerId,
      },
    );

    const escrow = this.escrowRepository.create({
      projectId,
      milestoneId: milestoneId || null,
      clientId,
      freelancerId,
      amount,
      currency,
      status: EscrowStatus.FUNDED,
      fundedAt: new Date(),
    });

    const saved = await this.escrowRepository.save(escrow);
    this.logger.log(`Escrow funded: ${saved.id} for project ${projectId}`);
    return { escrow: saved, clientSecret: paymentIntent.client_secret };
  }

  async releaseEscrow(id: string, userId: string): Promise<Escrow> {
    const escrow = await this.escrowRepository.findOne({ where: { id } });
    if (!escrow) {
      throw new NotFoundException(`Escrow ${id} not found`);
    }

    if (escrow.clientId !== userId) {
      throw new ForbiddenException('Only the client can release escrow funds');
    }

    if (escrow.status !== EscrowStatus.FUNDED) {
      throw new BadRequestException('Escrow is not in funded status');
    }

    // In a real implementation, you'd get the freelancer's Stripe account ID
    // await this.stripeService.createTransfer(escrow.amount, escrow.currency, freelancerStripeAccountId);

    escrow.status = EscrowStatus.RELEASED;
    escrow.releasedAt = new Date();
    const saved = await this.escrowRepository.save(escrow);
    this.logger.log(`Escrow released: ${id} to freelancer ${escrow.freelancerId}`);
    return saved;
  }

  async disputeEscrow(id: string, userId: string): Promise<Escrow> {
    const escrow = await this.escrowRepository.findOne({ where: { id } });
    if (!escrow) {
      throw new NotFoundException(`Escrow ${id} not found`);
    }

    if (escrow.clientId !== userId && escrow.freelancerId !== userId) {
      throw new ForbiddenException('You do not have permission to dispute this escrow');
    }

    if (escrow.status !== EscrowStatus.FUNDED) {
      throw new BadRequestException('Only funded escrows can be disputed');
    }

    escrow.status = EscrowStatus.DISPUTED;
    const saved = await this.escrowRepository.save(escrow);
    this.logger.warn(`Escrow disputed: ${id}`);
    return saved;
  }

  async findAll(userId: string): Promise<Escrow[]> {
    return this.escrowRepository
      .createQueryBuilder('escrow')
      .where('escrow.clientId = :userId OR escrow.freelancerId = :userId', { userId })
      .orderBy('escrow.createdAt', 'DESC')
      .getMany();
  }
}
