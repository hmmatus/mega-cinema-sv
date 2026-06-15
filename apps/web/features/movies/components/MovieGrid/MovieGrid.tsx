import { MovieCard } from '../MovieCard';
import { EmptyState } from '../EmptyState';
import type { MovieGridProps } from './types';

export function MovieGrid({ movies }: MovieGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
      {movies.length === 0 ? (
        <EmptyState />
      ) : (
        movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
      )}
    </div>
  );
}
