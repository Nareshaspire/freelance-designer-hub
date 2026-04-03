import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Bid } from './entities/bid.entity';
import { Milestone } from './entities/milestone.entity';
import { Task } from './entities/task.entity';
import { ProjectsService } from './projects.service';
import { BidsService } from './bids.service';
import { MilestonesService } from './milestones.service';
import { TasksService } from './tasks.service';
import { ProjectsController } from './projects.controller';
import { BidsController } from './bids.controller';
import { MilestonesController } from './milestones.controller';
import { TasksController } from './tasks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Bid, Milestone, Task])],
  providers: [ProjectsService, BidsService, MilestonesService, TasksService],
  controllers: [
    ProjectsController,
    BidsController,
    MilestonesController,
    TasksController,
  ],
  exports: [ProjectsService, BidsService, MilestonesService, TasksService],
})
export class ProjectsModule {}
