import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { User } from '@cinema/database';
import { PrismaService } from '../../../prisma/prisma.service';
import type { CreateUserData, UpdateUserData, UserRepository, UserWithRole } from '../../domain/ports/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByIdWithRole(id: string): Promise<UserWithRole | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    }) as Promise<UserWithRole | null>;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserData): Promise<User> {
    const role = await this.prisma.role.findUnique({ where: { name: 'CLIENTE' } });
    if (!role) throw new InternalServerErrorException('Default role CLIENTE not found. Run: pnpm db:seed');
    return this.prisma.user.create({
      data: {
        id: data.id,
        roleId: role.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        preferredLanguage: data.preferredLanguage ?? 'es',
      },
    });
  }

  async upsertProfile(data: CreateUserData): Promise<User> {
    const role = await this.prisma.role.findUnique({ where: { name: 'CLIENTE' } });
    if (!role) throw new InternalServerErrorException('Default role CLIENTE not found. Run: pnpm db:seed');
    return this.prisma.user.upsert({
      where: { id: data.id },
      update: {},
      create: {
        id: data.id,
        roleId: role.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        preferredLanguage: data.preferredLanguage ?? 'es',
      },
    });
  }

  update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  deactivate(id: string): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { status: 'INACTIVE' } });
  }
}
