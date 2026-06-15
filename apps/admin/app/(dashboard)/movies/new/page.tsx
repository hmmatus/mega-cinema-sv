'use client';

import { useRouter } from 'next/navigation';
import { MovieForm } from '@/src/features/movies/components/MovieForm';
import { useMovieForm } from '@/src/domain/movies/use-movie-form';

export default function NewMoviePage() {
  const router = useRouter();
  const { create } = useMovieForm();

  const handleSubmit = async (formData: any) => {
    try {
      await create.mutate(formData);
      router.push('/dashboard/movies');
    } catch (err) {
      console.error('Failed to create movie:', err);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Crear película</h1>
      <MovieForm
        onSubmit={handleSubmit}
        isLoading={create.isPending}
        error={create.error}
        onCancel={handleCancel}
      />
    </div>
  );
}
