import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(projectId: string, dto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create({ ...dto, projectId });
    return this.taskRepository.save(task);
  }

  async findByProject(
    projectId: string,
    groupByStatus?: boolean,
  ): Promise<Task[] | Record<string, Task[]>> {
    const tasks = await this.taskRepository.find({
      where: { projectId },
      order: { status: 'ASC', order: 'ASC' },
    });

    if (!groupByStatus) {
      return tasks;
    }

    return tasks.reduce<Record<string, Task[]>>((groups, task) => {
      const key = task.status;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(task);
      return groups;
    }, {});
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    Object.assign(task, dto);
    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    await this.taskRepository.remove(task);
  }

  async move(id: string, dto: MoveTaskDto): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    task.status = dto.status;
    task.order = dto.order;
    return this.taskRepository.save(task);
  }
}
