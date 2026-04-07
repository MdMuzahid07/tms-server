import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../generated/prisma/enums';
import { AuditLogWithRelations } from './audit-logs.repository';
import { AuditLogsService } from './audit-logs.service';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  findAll(): Promise<AuditLogWithRelations[]> {
    return this.auditLogsService.findAll();
  }

  @Get('task/:taskId')
  findByTask(
    @Param('taskId') taskId: string,
  ): Promise<AuditLogWithRelations[]> {
    return this.auditLogsService.findByTaskId(taskId);
  }
}
