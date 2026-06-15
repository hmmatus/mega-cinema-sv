import { Suspense } from 'react';
import { fetchMovies, fetchCurrentShowings } from '../domain/movies/movies.api';
import { fetchBanners } from '../domain/banners/banners.api';
import { BannerSection } from '../features/home/components/BannerSection';
import { CategoryTabs } from '../features/home/components/CategoryTabs';
import { MovieGrid } from '../features/movies/components/MovieGrid';
import type { TabValue } from '../features/home/components/CategoryTabs';
import type { Movie } from '../domain/movies/movies.types';

const TAB_TO_STATUS: Record<string, string | null> = {
  todos: null,
  estrenos: 'RELEASED',
  preventa: 'PRERELEASE',
  proximamente: 'UPCOMING',
};

async function getMovies(tab: string): Promise<Movie[]> {
  if (tab === 'esta-semana') {
    return fetchCurrentShowings(20);
  }
  const status = TAB_TO_STATUS[tab] ?? undefined;
  return fetchMovies({ status: status ?? undefined, pageSize: 20 });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = 'todos' } = await searchParams;
  const activeTab = tab as TabValue;

  const [movies, banners] = await Promise.all([
    getMovies(tab).catch(() => []),
    fetchBanners().catch(() => []),
  ]);

  return (
    <div>
      <BannerSection banners={banners} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Suspense fallback={null}>
            <CategoryTabs activeTab={activeTab} />
          </Suspense>
        </div>

        <MovieGrid movies={movies} />
      </div>
    </div>
  );
}
