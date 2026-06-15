'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MovieDetails } from '@/src/features/movies/components/MovieDetails';
import { useMovieDetails } from '@/src/domain/movies/use-movie-details';

interface MovieDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MovieDetailsPage({ params }: MovieDetailsPageProps) {
  return (
    <MovieDetailsWrapper paramsPromise={params} />
  );
}

function MovieDetailsWrapper({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const [movieId, setMovieId] = React.useState<string | null>(null);

  React.useEffect(() => {
    paramsPromise.then((p) => setMovieId(p.id));
  }, [paramsPromise]);

  if (!movieId) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return <MovieDetailsClient movieId={movieId} />;
}

function MovieDetailsClient({ movieId }: { movieId: string }) {
  const router = useRouter();
  const { movie, isLoading, error } = useMovieDetails(movieId);

  const handleEdit = (id: string) => {
    router.push(`/dashboard/movies/${id}/edit`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      <MovieDetails
        movieId={movieId}
        movie={movie}
        isLoading={isLoading}
        error={error?.message}
        onEdit={handleEdit}
        onBack={handleBack}
      />
    </div>
  );
}
