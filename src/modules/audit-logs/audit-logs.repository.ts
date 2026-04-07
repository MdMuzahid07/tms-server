import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateAuditLogInput {
  action: AuditAction;
  actorId: string;
  taskId: string;
  beforeData?: Record<string, unknown>;
  afterData?: Record<string, unknown>;
  summary?: string;
}

export type AuditLogWithRelations = Prisma.AuditLogGetPayload<{
  include: {
    actor: { select: { id: true; name: true; email: true; role: true } };
    task: { select: { id: true; title: true } };
  };
}>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const auditInclude = {
  actor: { select: { id: true, name: true, email: true, role: true } },
  task: { select: { id: true, title: true } },
} satisfies Prisma.AuditLogInclude;

@Injectable()
export class AuditLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAuditLogInput): Promise<AuditLogWithRelations> {
    return this.prisma.auditLog.create({ data, include: auditInclude });
  }

  findAll(): Promise<AuditLogWithRelations[]> {
    return this.prisma.auditLog.findMany({
      include: auditInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findByTaskId(taskId: string): Promise<AuditLogWithRelations[]> {
    return this.prisma.auditLog.findMany({
      where: { taskId },
      include: auditInclude,
      orderBy: { createdAt: 'desc' },
    });
  }
}
