import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { User } from '../../generated/prisma/client';
import { UserRole } from '../../generated/prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskWithAssignee } from './tasks.repository';
import { DeleteResult, TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: User,
  ): Promise<TaskWithAssignee> {
    return this.tasksService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: User): Promise<TaskWithAssignee[]> {
    return this.tasksService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<TaskWithAssignee> {
    return this.tasksService.findById(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: User,
  ): Promise<TaskWithAssignee> {
    return this.tasksService.update(id, dto, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.USER)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser() user: User,
  ): Promise<TaskWithAssignee> {
    return this.tasksService.updateStatus(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<DeleteResult> {
    return this.tasksService.delete(id, user);
  }
}
