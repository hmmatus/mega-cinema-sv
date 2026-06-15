import Image from 'next/image';
import type { BannerSectionProps } from './types';

export function BannerSection({ banners }: BannerSectionProps) {
  const banner = banners[0];

  if (!banner) {
    return (
      <div className="w-full h-[360px] md:h-[480px] bg-[#F1F5F9] flex items-center justify-center">
        <span className="text-[#94A3B8] text-sm">Sin banners activos</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[360px] md:h-[480px] overflow-hidden">
      <Image
        src={banner.imageUrl}
        alt={banner.title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      {banner.targetUrl && (
        <a
          href={banner.targetUrl}
          className="absolute inset-0"
          aria-label={banner.title}
        />
      )}
    </div>
  );
}
