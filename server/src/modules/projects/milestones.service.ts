import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Milestone, MilestoneStatus } from './entities/milestone.entity';
import { Project } from './entities/project.entity';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';

@Injectable()
export class MilestonesService {
  constructor(
    @InjectRepository(Milestone)
    private readonly milestoneRepository: Repository<Milestone>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(
    projectId: string,
    userId: string,
    dto: CreateMilestoneDto,
  ): Promise<Milestone> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const milestone = this.milestoneRepository.create({ ...dto, projectId });
    return this.milestoneRepository.save(milestone);
  }

  async findByProject(projectId: string): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      where: { projectId },
      order: { order: 'ASC' },
      relations: ['tasks'],
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateMilestoneDto,
  ): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id },
      relations: ['project'],
    });
    if (!milestone) {
      throw new NotFoundException(`Milestone ${id} not found`);
    }
    // Only the client or freelancer on the project can update
    const { project } = milestone;
    if (project.clientId !== userId && project.freelancerId !== userId) {
      throw new ForbiddenException(
        'Only project participants can update milestones',
      );
    }
    Object.assign(milestone, dto);
    return this.milestoneRepository.save(milestone);
  }

  async submit(
    id: string,
    freelancerId: string,
    deliverableUrl: string,
  ): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id },
      relations: ['project'],
    });
    if (!milestone) {
      throw new NotFoundException(`Milestone ${id} not found`);
    }
    if (milestone.project.freelancerId !== freelancerId) {
      throw new ForbiddenException(
        'Only the assigned freelancer can submit milestones',
      );
    }
    milestone.status = MilestoneStatus.SUBMITTED;
    milestone.deliverableUrl = deliverableUrl;
    return this.milestoneRepository.save(milestone);
  }

  async approve(id: string, clientId: string): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id },
      relations: ['project'],
    });
    if (!milestone) {
      throw new NotFoundException(`Milestone ${id} not found`);
    }
    if (milestone.project.clientId !== clientId) {
      throw new ForbiddenException(
        'Only the project client can approve milestones',
      );
    }
    milestone.status = MilestoneStatus.APPROVED;
    return this.milestoneRepository.save(milestone);
  }

  async reject(id: string, clientId: string): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id },
      relations: ['project'],
    });
    if (!milestone) {
      throw new NotFoundException(`Milestone ${id} not found`);
    }
    if (milestone.project.clientId !== clientId) {
      throw new ForbiddenException(
        'Only the project client can reject milestones',
      );
    }
    milestone.status = MilestoneStatus.REJECTED;
    return this.milestoneRepository.save(milestone);
  }
}
