'use client';

import { useRouter } from 'next/navigation';
import { MovieDetails } from '@/src/features/movies/components/MovieDetails';
import { useMovieDetails } from '@/src/domain/movies/use-movie-details';

interface MovieDetailsPageProps {
  params: {
    id: string;
  };
}

export default function MovieDetailsPage({ params }: MovieDetailsPageProps) {
  const router = useRouter();
  const { movie, isLoading, error } = useMovieDetails(params.id);

  const handleEdit = (id: string) => {
    router.push(`/dashboard/movies/${id}/edit`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      <MovieDetails
        movieId={params.id}
        movie={movie}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onBack={handleBack}
      />
    </div>
  );
}
