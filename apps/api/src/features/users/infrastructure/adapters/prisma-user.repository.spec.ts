import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PrismaUserRepository } from './prisma-user.repository';

const mockRole = { id: 'role-uuid', name: 'CLIENTE' };
const mockUser = {
  id: 'user-uuid',
  roleId: 'role-uuid',
  firstName: 'Ana',
  lastName: 'Lopez',
  email: 'ana@test.com',
  passwordHash: null,
  status: 'ACTIVE',
  preferredLanguage: 'es',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  role: { findUnique: jest.fn() },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
};

describe('PrismaUserRepository', () => {
  let repo: PrismaUserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repo = module.get(PrismaUserRepository);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await repo.findById('user-uuid');
      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-uuid' } });
    });

    it('returns null when not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await repo.findById('missing');
      expect(result).toBeNull();
    });
  });

  describe('findByIdWithRole', () => {
    it('returns user with role when found', async () => {
      const userWithRole = { ...mockUser, role: mockRole };
      mockPrisma.user.findUnique.mockResolvedValue(userWithRole);
      const result = await repo.findByIdWithRole('user-uuid');
      expect(result).toEqual(userWithRole);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
        include: { role: true },
      });
    });

    it('returns null when not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await repo.findByIdWithRole('missing');
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('returns user when found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await repo.findByEmail('ana@test.com');
      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'ana@test.com' } });
    });
  });

  describe('create', () => {
    it('creates user with CLIENTE role', async () => {
      mockPrisma.role.findUnique.mockResolvedValue(mockRole);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await repo.create({
        id: 'user-uuid',
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@test.com',
      });

      expect(mockPrisma.role.findUnique).toHaveBeenCalledWith({ where: { name: 'CLIENTE' } });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          id: 'user-uuid',
          roleId: 'role-uuid',
          firstName: 'Ana',
          lastName: 'Lopez',
          email: 'ana@test.com',
          preferredLanguage: 'es',
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('throws InternalServerErrorException when CLIENTE role not found', async () => {
      mockPrisma.role.findUnique.mockResolvedValue(null);
      await expect(
        repo.create({ id: 'x', firstName: 'A', lastName: 'B', email: 'a@b.com' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('updates user fields', async () => {
      const updated = { ...mockUser, firstName: 'Updated' };
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await repo.update('user-uuid', { firstName: 'Updated' });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
        data: { firstName: 'Updated' },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('upsertProfile', () => {
    it('upserts user with CLIENTE role', async () => {
      mockPrisma.role.findUnique.mockResolvedValue(mockRole);
      mockPrisma.user.upsert.mockResolvedValue(mockUser);

      const result = await repo.upsertProfile({
        id: 'user-uuid',
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@test.com',
      });

      expect(mockPrisma.role.findUnique).toHaveBeenCalledWith({ where: { name: 'CLIENTE' } });
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
        update: {},
        create: {
          id: 'user-uuid',
          roleId: 'role-uuid',
          firstName: 'Ana',
          lastName: 'Lopez',
          email: 'ana@test.com',
          preferredLanguage: 'es',
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('throws InternalServerErrorException when CLIENTE role not found', async () => {
      mockPrisma.role.findUnique.mockResolvedValue(null);
      await expect(
        repo.upsertProfile({ id: 'x', firstName: 'A', lastName: 'B', email: 'a@b.com' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deactivate', () => {
    it('sets status to INACTIVE', async () => {
      const deactivated = { ...mockUser, status: 'INACTIVE' };
      mockPrisma.user.update.mockResolvedValue(deactivated);

      const result = await repo.deactivate('user-uuid');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
        data: { status: 'INACTIVE' },
      });
      expect(result).toEqual(deactivated);
    });
  });
});
