import { z } from 'zod';
import { MovieListSchema, MovieSchema, type Movie } from './movies.types';

export async function fetchMovies(params: {
  status?: string;
  pageSize?: number;
} = {}): Promise<Movie[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/movies`);
  if (params.status) url.searchParams.set('status', params.status);
  url.searchParams.set('pageSize', String(params.pageSize ?? 20));

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`movies fetch failed: ${res.status}`);

  const json = await res.json();
  return MovieListSchema.parse(json).data;
}

export async function fetchCurrentShowings(limit = 20): Promise<Movie[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/movies/current-showings`);
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`current-showings fetch failed: ${res.status}`);

  const json = await res.json();
  return z.array(MovieSchema).parse(json);
}
