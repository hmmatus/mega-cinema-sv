import { Inject, Injectable } from '@nestjs/common';
import type { Banner } from '@cinema/database';
import { BANNER_REPOSITORY, type BannerRepository } from '../domain/ports/banner.repository';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

@Injectable()
export class GetBannerUseCase {
  constructor(@Inject(BANNER_REPOSITORY) private readonly bannerRepo: BannerRepository) {}

  async execute(id: string, isAdmin: boolean): Promise<Banner> {
    const banner = await this.bannerRepo.findById(id);
    if (!banner) this.notFound();
    if (!isAdmin && banner!.status !== 'ACTIVE') this.notFound();
    return banner!;
  }

  private notFound(): never {
    throw new HttpProblemException({ type: '/problems/banner-not-found', title: 'Banner Not Found', status: 404, message: 'The requested banner does not exist.' });
  }
}
