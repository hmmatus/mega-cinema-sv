import { Injectable } from '@nestjs/common';
import type { Prisma } from '@cinema/database';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditPayload {
  userId: string;
  roleId: string;
  entityName: string;
  entityId: string;
  action: string;
  previousValue?: object | null;
  newValue?: object | null;
  metadata?: object | null;
  sourceIp?: string;
}

type PrismaOrTx = PrismaService | Prisma.TransactionClient;

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(prismaOrTx: PrismaOrTx, payload: AuditPayload): Promise<void> {
    const client = prismaOrTx as PrismaService;
    return client.auditLog
      .create({
        data: {
          userId: payload.userId,
          roleId: payload.roleId,
          entityName: payload.entityName,
          entityId: payload.entityId,
          action: payload.action,
          previousValue: payload.previousValue ?? undefined,
          newValue: payload.newValue ?? undefined,
          metadata: payload.metadata ?? undefined,
          sourceIp: payload.sourceIp,
        },
      })
      .then(() => undefined);
  }
}
