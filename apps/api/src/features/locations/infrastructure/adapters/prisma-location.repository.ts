import { Injectable } from '@nestjs/common';
import type { Branch } from '@cinema/database';
import { PrismaService } from '../../../../prisma/prisma.service';
import type {
  CreateLocationData,
  LocationFilters,
  LocationPagination,
  LocationRepository,
  LocationWithDetails,
  PaginatedLocations,
  UpdateLocationData,
} from '../../domain/ports/location.repository';

@Injectable()
export class PrismaLocationRepository implements LocationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filters: LocationFilters, pagination: LocationPagination): Promise<PaginatedLocations> {
    const { page, pageSize, sortBy, sortOrder } = pagination;
    const skip = page * pageSize;
    const where = this.buildWhere(filters);
    const orderBy = { [sortBy]: sortOrder };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.branch.findMany({ where, orderBy, skip, take: pageSize }),
      this.prisma.branch.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return {
      data,
      pagination: { total, page, pageSize, totalPages, hasNextPage: page < totalPages - 1, hasPreviousPage: page > 0 },
    };
  }

  findById(id: string): Promise<Branch | null> {
    return this.prisma.branch.findUnique({ where: { id } });
  }

  async findByIdWithDetails(id: string): Promise<LocationWithDetails | null> {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: { rooms: { where: { status: 'ACTIVA' }, select: { id: true, name: true, capacity: true } } },
    });
    if (!branch) return null;
    const totalSeats = branch.rooms.reduce((sum, r) => sum + r.capacity, 0);
    return { ...branch, rooms: branch.rooms, totalRooms: branch.rooms.length, totalSeats };
  }

  async findByCity(city: string): Promise<Branch[]> {
    return this.prisma.branch.findMany({
      where: { city: { contains: city, mode: 'insensitive' }, status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  findAllWithCoords(): Promise<Branch[]> {
    return this.prisma.branch.findMany({
      where: { status: 'ACTIVE', latitude: { not: null }, longitude: { not: null } },
    });
  }

  create(data: CreateLocationData): Promise<Branch> {
    return this.prisma.branch.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone,
        description: data.description,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country ?? 'El Salvador',
        email: data.email,
        latitude: data.latitude,
        longitude: data.longitude,
        status: data.status ?? 'ACTIVE',
        operatingHours: data.operatingHours ?? undefined,
        imageUrl: data.imageUrl,
        features: data.features ?? [],
        metadata: data.metadata ?? undefined,
        createdById: data.createdById,
      },
    });
  }

  update(id: string, data: UpdateLocationData): Promise<Branch> {
    return this.prisma.branch.update({
      where: { id },
      data: {
        ...data,
        operatingHours: data.operatingHours ?? undefined,
        metadata: data.metadata ?? undefined,
      },
    });
  }

  private buildWhere(filters: LocationFilters) {
    return {
      ...(filters.status && { status: filters.status }),
      ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' as const } }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' as const } },
          { city: { contains: filters.search, mode: 'insensitive' as const } },
        ],
      }),
    };
  }
}
