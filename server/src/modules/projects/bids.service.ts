import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid, BidStatus } from './entities/bid.entity';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(
    projectId: string,
    freelancerId: string,
    dto: CreateBidDto,
  ): Promise<Bid> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const existing = await this.bidRepository.findOne({
      where: { projectId, freelancerId },
    });
    if (existing) {
      throw new ConflictException(
        'You have already placed a bid on this project',
      );
    }

    const bid = this.bidRepository.create({ ...dto, projectId, freelancerId });
    return this.bidRepository.save(bid);
  }

  async findByProject(projectId: string, clientId: string): Promise<Bid[]> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    if (project.clientId !== clientId) {
      throw new ForbiddenException('Only the project owner can view all bids');
    }
    return this.bidRepository.find({ where: { projectId } });
  }

  async findMyBids(freelancerId: string): Promise<Bid[]> {
    return this.bidRepository.find({
      where: { freelancerId },
      relations: ['project'],
    });
  }

  async update(
    id: string,
    freelancerId: string,
    dto: UpdateBidDto,
  ): Promise<Bid> {
    const bid = await this.bidRepository.findOne({ where: { id } });
    if (!bid) {
      throw new NotFoundException(`Bid ${id} not found`);
    }
    if (bid.freelancerId !== freelancerId) {
      throw new ForbiddenException('Only the bid owner can update it');
    }
    if (bid.status !== BidStatus.PENDING) {
      throw new ForbiddenException('Only pending bids can be updated');
    }
    Object.assign(bid, dto);
    return this.bidRepository.save(bid);
  }

  async withdraw(id: string, freelancerId: string): Promise<void> {
    const bid = await this.bidRepository.findOne({ where: { id } });
    if (!bid) {
      throw new NotFoundException(`Bid ${id} not found`);
    }
    if (bid.freelancerId !== freelancerId) {
      throw new ForbiddenException('Only the bid owner can withdraw it');
    }
    bid.status = BidStatus.WITHDRAWN;
    await this.bidRepository.save(bid);
  }

  async accept(id: string, clientId: string): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id },
      relations: ['project'],
    });
    if (!bid) {
      throw new NotFoundException(`Bid ${id} not found`);
    }
    if (bid.project.clientId !== clientId) {
      throw new ForbiddenException('Only the project owner can accept bids');
    }

    // Accept this bid
    bid.status = BidStatus.ACCEPTED;
    await this.bidRepository.save(bid);

    // Update project: assign freelancer and set status to in_progress
    await this.projectRepository.update(bid.projectId, {
      freelancerId: bid.freelancerId,
      status: ProjectStatus.IN_PROGRESS,
    });

    // Reject all other pending bids for this project
    await this.bidRepository
      .createQueryBuilder()
      .update(Bid)
      .set({ status: BidStatus.REJECTED })
      .where('projectId = :projectId AND id != :bidId AND status = :status', {
        projectId: bid.projectId,
        bidId: bid.id,
        status: BidStatus.PENDING,
      })
      .execute();

    return bid;
  }

  async reject(id: string, clientId: string): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id },
      relations: ['project'],
    });
    if (!bid) {
      throw new NotFoundException(`Bid ${id} not found`);
    }
    if (bid.project.clientId !== clientId) {
      throw new ForbiddenException('Only the project owner can reject bids');
    }
    bid.status = BidStatus.REJECTED;
    return this.bidRepository.save(bid);
  }
}
