import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(clientId: string, dto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create({
      ...dto,
      clientId,
      status: ProjectStatus.DRAFT,
    });
    return this.projectRepository.save(project);
  }

  async findAll(
    query: ProjectQueryDto,
  ): Promise<{ data: Project[]; total: number; page: number; limit: number }> {
    const {
      category,
      budgetMin,
      budgetMax,
      skills,
      status,
      sort,
      page = 1,
      limit = 10,
    } = query;

    const qb = this.projectRepository.createQueryBuilder('project');

    if (category) {
      qb.andWhere('project.category = :category', { category });
    }

    if (budgetMin !== undefined) {
      qb.andWhere('project.budget >= :budgetMin', { budgetMin });
    }

    if (budgetMax !== undefined) {
      qb.andWhere('project.budget <= :budgetMax', { budgetMax });
    }

    if (status) {
      qb.andWhere('project.status = :status', { status });
    }

    if (skills && skills.length > 0) {
      // Filter projects whose requiredSkills contains at least one of the requested skills
      skills.forEach((skill, index) => {
        qb.andWhere(`project.requiredSkills LIKE :skill${index}`, {
          [`skill${index}`]: `%${skill}%`,
        });
      });
    }

    switch (sort) {
      case 'budget_asc':
        qb.orderBy('project.budget', 'ASC');
        break;
      case 'budget_desc':
        qb.orderBy('project.budget', 'DESC');
        break;
      case 'deadline':
        qb.orderBy('project.deadline', 'ASC');
        break;
      case 'newest':
      default:
        qb.orderBy('project.createdAt', 'DESC');
        break;
    }

    const offset = (page - 1) * limit;
    qb.skip(offset).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['bids', 'milestones', 'tasks'],
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  async update(
    id: string,
    clientId: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findOne(id);
    if (project.clientId !== clientId) {
      throw new ForbiddenException('Only the project owner can update it');
    }
    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  async remove(id: string, clientId: string): Promise<void> {
    const project = await this.findOne(id);
    if (project.clientId !== clientId) {
      throw new ForbiddenException('Only the project owner can delete it');
    }
    if (project.status !== ProjectStatus.DRAFT) {
      throw new BadRequestException('Only draft projects can be deleted');
    }
    await this.projectRepository.remove(project);
  }

  async updateStatus(
    id: string,
    clientId: string,
    status: ProjectStatus,
  ): Promise<Project> {
    const project = await this.findOne(id);
    if (project.clientId !== clientId) {
      throw new ForbiddenException(
        'Only the project owner can update its status',
      );
    }
    project.status = status;
    return this.projectRepository.save(project);
  }
}
