import { BannerListSchema, type Banner } from './banners.types';

export async function fetchBanners(): Promise<Banner[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banners`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`banners fetch failed: ${res.status}`);

  const json = await res.json();
  return BannerListSchema.parse(json).data;
}
