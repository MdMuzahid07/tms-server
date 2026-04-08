import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateAuditLogInput {
  action: AuditAction;
  actorId: string;
  taskId: string;
  beforeData?: Prisma.InputJsonValue;
  afterData?: Prisma.InputJsonValue;
  summary?: string;
}

const auditInclude = {
  actor: { select: { id: true, name: true, email: true, role: true } },
  task: { select: { id: true, title: true } },
} satisfies Prisma.AuditLogInclude;

export type AuditLogWithRelations = Prisma.AuditLogGetPayload<{
  include: typeof auditInclude;
}>;

@Injectable()
export class AuditLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAuditLogInput): Promise<AuditLogWithRelations> {
    return this.prisma.auditLog.create({
      data,
      include: auditInclude,
    }) as Promise<AuditLogWithRelations>;
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
