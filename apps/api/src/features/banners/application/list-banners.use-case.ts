import { Inject, Injectable } from '@nestjs/common';
import type { BannerStatus } from '@cinema/database';
import { BANNER_REPOSITORY, type BannerRepository, type PaginatedBanners } from '../domain/ports/banner.repository';
import type { ListBannersQueryDto } from '../dtos/list-banners-query.dto';

@Injectable()
export class ListBannersUseCase {
  constructor(@Inject(BANNER_REPOSITORY) private readonly bannerRepo: BannerRepository) {}

  execute(query: ListBannersQueryDto, isAdmin: boolean): Promise<PaginatedBanners> {
    const status: BannerStatus | undefined = isAdmin ? query.status : 'ACTIVE';
    return this.bannerRepo.findMany(
      { status },
      { page: query.page ?? 0, pageSize: query.pageSize ?? 20, sortBy: query.sortBy ?? 'position', sortOrder: query.sortOrder ?? 'asc' },
    );
  }

  getActive() {
    return this.bannerRepo.findActive();
  }
}
