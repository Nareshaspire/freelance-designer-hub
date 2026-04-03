import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { BidsService } from './bids.service';
import { MilestonesService } from './milestones.service';
import { TasksService } from './tasks.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { CreateBidDto } from './dto/create-bid.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { ProjectStatus } from './entities/project.entity';

// TODO: Add AuthGuard once auth module is implemented
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly bidsService: BidsService,
    private readonly milestonesService: MilestonesService,
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateProjectDto) {
    const clientId: string = req.user?.id || 'test-user';
    return this.projectsService.create(clientId, dto);
  }

  @Get()
  findAll(@Query() query: ProjectQueryDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateProjectDto,
  ) {
    const clientId: string = req.user?.id || 'test-user';
    return this.projectsService.update(id, clientId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const clientId: string = req.user?.id || 'test-user';
    return this.projectsService.remove(id, clientId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Req() req: any,
    @Body('status') status: ProjectStatus,
  ) {
    const clientId: string = req.user?.id || 'test-user';
    return this.projectsService.updateStatus(id, clientId, status);
  }

  // --- Bids sub-resource ---

  @Post(':id/bids')
  createBid(
    @Param('id') projectId: string,
    @Req() req: any,
    @Body() dto: CreateBidDto,
  ) {
    const freelancerId: string = req.user?.id || 'test-user';
    return this.bidsService.create(projectId, freelancerId, dto);
  }

  @Get(':id/bids')
  getProjectBids(@Param('id') projectId: string, @Req() req: any) {
    const clientId: string = req.user?.id || 'test-user';
    return this.bidsService.findByProject(projectId, clientId);
  }

  // --- Milestones sub-resource ---

  @Post(':id/milestones')
  createMilestone(
    @Param('id') projectId: string,
    @Req() req: any,
    @Body() dto: CreateMilestoneDto,
  ) {
    const userId: string = req.user?.id || 'test-user';
    return this.milestonesService.create(projectId, userId, dto);
  }

  @Get(':id/milestones')
  getMilestones(@Param('id') projectId: string) {
    return this.milestonesService.findByProject(projectId);
  }

  // --- Tasks sub-resource ---

  @Post(':id/tasks')
  createTask(@Param('id') projectId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(projectId, dto);
  }

  @Get(':id/tasks')
  getTasks(
    @Param('id') projectId: string,
    @Query('groupByStatus') groupByStatus?: string,
  ) {
    return this.tasksService.findByProject(projectId, groupByStatus === 'true');
  }
}
