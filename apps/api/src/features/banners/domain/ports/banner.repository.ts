import type { Banner, BannerStatus, BannerTargetType } from '@cinema/database';

export const BANNER_REPOSITORY = Symbol('BannerRepository');

export interface BannerFilters {
  status?: BannerStatus;
}

export interface BannerPagination {
  page: number;
  pageSize: number;
  sortBy: 'position' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedBanners {
  data: Banner[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateBannerData {
  title: string;
  description?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  targetUrl?: string | null;
  targetType?: BannerTargetType;
  targetId?: string | null;
  position: number;
  status?: BannerStatus;
  expiresAt?: Date | null;
  metadata?: object | null;
  createdById?: string | null;
}

export interface UpdateBannerData extends Partial<CreateBannerData> {
  updatedById?: string | null;
}

export interface ReorderItem {
  id: string;
  position: number;
}

export interface BannerRepository {
  findMany(filters: BannerFilters, pagination: BannerPagination): Promise<PaginatedBanners>;
  findById(id: string): Promise<Banner | null>;
  findActive(): Promise<Banner[]>;
  create(data: CreateBannerData): Promise<Banner>;
  update(id: string, data: UpdateBannerData): Promise<Banner>;
  reorder(items: ReorderItem[]): Promise<Banner[]>;
}
