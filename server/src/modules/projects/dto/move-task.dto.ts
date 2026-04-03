import { IsEnum, IsNumber, IsInt } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class MoveTaskDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsNumber()
  @IsInt()
  order: number;
}
