import { Injectable } from '@nestjs/common';
import {
  AuditLogsRepository,
  AuditLogWithRelations,
  CreateAuditLogInput,
} from './audit-logs.repository';

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  log(params: CreateAuditLogInput): Promise<AuditLogWithRelations> {
    return this.auditLogsRepository.create(params);
  }

  findAll(): Promise<AuditLogWithRelations[]> {
    return this.auditLogsRepository.findAll();
  }

  findByTaskId(taskId: string): Promise<AuditLogWithRelations[]> {
    return this.auditLogsRepository.findByTaskId(taskId);
  }
}
