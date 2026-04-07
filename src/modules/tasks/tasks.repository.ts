import { Injectable } from '@nestjs/common';
import { Prisma, Task, TaskStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export type TaskWithAssignee = Prisma.TaskGetPayload<{
  include: {
    assignedTo: {
      select: { id: true; name: true; email: true; role: true };
    };
  };
}>;

const taskInclude = {
  assignedTo: {
    select: { id: true, name: true, email: true, role: true },
  },
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTaskDto): Promise<TaskWithAssignee> {
    return this.prisma.task.create({ data, include: taskInclude });
  }

  findAll(): Promise<TaskWithAssignee[]> {
    return this.prisma.task.findMany({ include: taskInclude });
  }

  findByAssignedUser(userId: string): Promise<TaskWithAssignee[]> {
    return this.prisma.task.findMany({
      where: { assignedToId: userId },
      include: taskInclude,
    });
  }

  findById(id: string): Promise<TaskWithAssignee | null> {
    return this.prisma.task.findUnique({ where: { id }, include: taskInclude });
  }

  update(id: string, data: UpdateTaskDto): Promise<TaskWithAssignee> {
    return this.prisma.task.update({
      where: { id },
      data,
      include: taskInclude,
    });
  }

  updateStatus(id: string, status: TaskStatus): Promise<TaskWithAssignee> {
    return this.prisma.task.update({
      where: { id },
      data: { status },
      include: taskInclude,
    });
  }

  delete(id: string): Promise<Task> {
    return this.prisma.task.delete({ where: { id } });
  }
}
