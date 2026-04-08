import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AuditAction,
  Prisma,
  User,
  UserRole,
} from '../../generated/prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksRepository, TaskWithAssignee } from './tasks.repository';

export interface DeleteResult {
  message: string;
}

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreateTaskDto, actor: User): Promise<TaskWithAssignee> {
    const task = await this.tasksRepository.create(dto);

    await this.auditLogsService.log({
      action: AuditAction.TASK_CREATED,
      actorId: actor.id,
      taskId: task.id,
      afterData: task as unknown as Prisma.InputJsonValue,
      summary: `Task "${task.title}" created by ${actor.name}`,
    });

    return task;
  }

  findAll(actor: User): Promise<TaskWithAssignee[]> {
    if (actor.role === UserRole.ADMIN) {
      return this.tasksRepository.findAll();
    }
    return this.tasksRepository.findByAssignedUser(actor.id);
  }

  async findById(id: string, actor: User): Promise<TaskWithAssignee> {
    const task = await this.tasksRepository.findById(id);
    if (!task) throw new NotFoundException('Task not found');

    if (actor.role === UserRole.USER && task.assignedToId !== actor.id) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    actor: User,
  ): Promise<TaskWithAssignee> {
    const before = await this.tasksRepository.findById(id);
    if (!before) throw new NotFoundException('Task not found');

    const after = await this.tasksRepository.update(id, dto);

    const isAssignment =
      dto.assignedToId !== undefined &&
      dto.assignedToId !== before.assignedToId;

    await this.auditLogsService.log({
      action: isAssignment
        ? AuditAction.TASK_ASSIGNED
        : AuditAction.TASK_UPDATED,
      actorId: actor.id,
      taskId: id,
      beforeData: before as unknown as Prisma.InputJsonValue,
      afterData: after as unknown as Prisma.InputJsonValue,
      summary: isAssignment
        ? `Task "${after.title}" assigned to ${after.assignedTo?.name ?? 'unknown'}`
        : `Task "${after.title}" updated by ${actor.name}`,
    });

    return after;
  }

  async updateStatus(
    id: string,
    dto: UpdateTaskStatusDto,
    actor: User,
  ): Promise<TaskWithAssignee> {
    const before = await this.tasksRepository.findById(id);
    if (!before) throw new NotFoundException('Task not found');

    if (actor.role === UserRole.USER && before.assignedToId !== actor.id) {
      throw new ForbiddenException('Access denied');
    }

    const after = await this.tasksRepository.updateStatus(id, dto.status);

    await this.auditLogsService.log({
      action: AuditAction.TASK_STATUS_CHANGED,
      actorId: actor.id,
      taskId: id,
      beforeData: { status: before.status },
      afterData: { status: after.status },
      summary: `Status changed from ${before.status} to ${after.status} by ${actor.name}`,
    });

    return after;
  }

  async delete(id: string, actor: User): Promise<DeleteResult> {
    const task = await this.tasksRepository.findById(id);
    if (!task) throw new NotFoundException('Task not found');

    await this.auditLogsService.log({
      action: AuditAction.TASK_DELETED,
      actorId: actor.id,
      taskId: id,
      beforeData: task as unknown as Prisma.InputJsonValue,
      summary: `Task "${task.title}" deleted by ${actor.name}`,
    });

    await this.tasksRepository.delete(id);
    return { message: 'Task deleted successfully' };
  }
}
