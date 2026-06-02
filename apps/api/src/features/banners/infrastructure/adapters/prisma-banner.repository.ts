import { Injectable } from '@nestjs/common';
import type { Banner } from '@cinema/database';
import { PrismaService } from '../../../../prisma/prisma.service';
import type {
  BannerFilters,
  BannerPagination,
  BannerRepository,
  CreateBannerData,
  PaginatedBanners,
  ReorderItem,
  UpdateBannerData,
} from '../../domain/ports/banner.repository';

@Injectable()
export class PrismaBannerRepository implements BannerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filters: BannerFilters, pagination: BannerPagination): Promise<PaginatedBanners> {
    const { page, pageSize, sortBy, sortOrder } = pagination;
    const skip = page * pageSize;
    const where = filters.status ? { status: filters.status } : {};
    const orderBy = { [sortBy]: sortOrder };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.banner.findMany({ where, orderBy, skip, take: pageSize }),
      this.prisma.banner.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return {
      data,
      pagination: { total, page, pageSize, totalPages, hasNextPage: page < totalPages - 1, hasPreviousPage: page > 0 },
    };
  }

  findById(id: string): Promise<Banner | null> {
    return this.prisma.banner.findUnique({ where: { id } });
  }

  findActive(): Promise<Banner[]> {
    return this.prisma.banner.findMany({ where: { status: 'ACTIVE' }, orderBy: { position: 'asc' } });
  }

  create(data: CreateBannerData): Promise<Banner> {
    return this.prisma.banner.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        mobileImageUrl: data.mobileImageUrl,
        targetUrl: data.targetUrl,
        targetType: data.targetType ?? 'EXTERNAL',
        targetId: data.targetId,
        position: data.position,
        status: data.status ?? 'DRAFT',
        expiresAt: data.expiresAt,
        metadata: data.metadata ?? undefined,
        createdById: data.createdById,
      },
    });
  }

  update(id: string, data: UpdateBannerData): Promise<Banner> {
    return this.prisma.banner.update({
      where: { id },
      data: {
        ...data,
        metadata: data.metadata ?? undefined,
        expiresAt: data.expiresAt ?? undefined,
      },
    });
  }

  async reorder(items: ReorderItem[]): Promise<Banner[]> {
    const updated = await this.prisma.$transaction(
      items.map((item) => this.prisma.banner.update({ where: { id: item.id }, data: { position: item.position } })),
    );
    return updated;
  }
}
