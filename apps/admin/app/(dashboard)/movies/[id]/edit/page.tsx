'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MovieForm } from '@/src/features/movies/components/MovieForm';
import { useMovieDetails } from '@/src/domain/movies/use-movie-details';
import { useMovieForm } from '@/src/domain/movies/use-movie-form';

interface EditMoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditMoviePage({ params }: EditMoviePageProps) {
  return (
    <EditMovieClientPage paramsPromise={params} />
  );
}

function EditMovieClientPage({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const [movieId, setMovieId] = React.useState<string | null>(null);

  React.useEffect(() => {
    paramsPromise.then((p) => setMovieId(p.id));
  }, [paramsPromise]);

  if (!movieId) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return <EditMovieContent movieId={movieId} />;
}

function EditMovieContent({ movieId }: { movieId: string }) {
  const router = useRouter();
  const { movie, isLoading: isLoadingMovie } = useMovieDetails(movieId);
  const { update } = useMovieForm();

  const handleSubmit = async (formData: any) => {
    try {
      await update.mutate(movieId, formData);
      router.push(`/dashboard/movies/${movieId}`);
    } catch (err) {
      console.error('Failed to update movie:', err);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoadingMovie) {
    return <p className="text-gray-500">Loading movie...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Editar película</h1>
      <MovieForm
        initialData={movie}
        onSubmit={handleSubmit}
        isLoading={update.isPending}
        error={update.error}
        onCancel={handleCancel}
      />
    </div>
  );
}
