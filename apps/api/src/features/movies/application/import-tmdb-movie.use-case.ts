import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Movie } from '@cinema/database';
import { MOVIE_REPOSITORY, type MovieRepository } from '../domain/ports/movie.repository';
import { SupabaseStorageService } from '../../../common/storage/supabase-storage.service';
import * as https from 'https';

interface TmdbMovieDetail {
  id: number;
  title: string;
  overview: string;
  runtime: number;
  vote_average: number;
  original_language: string;
  release_date: string;
  poster_path: string;
}

@Injectable()
export class ImportTmdbMovieUseCase {
  private readonly logger = new Logger(ImportTmdbMovieUseCase.name);

  constructor(
    @Inject(MOVIE_REPOSITORY) private readonly movieRepo: MovieRepository,
    private readonly storage: SupabaseStorageService,
  ) {}

  async execute(tmdbId: number, apiKey: string): Promise<Movie> {
    const detail = await this.fetchTmdbDetail(tmdbId, apiKey);
    let posterUrl: string | undefined;

    if (detail.poster_path) {
      try {
        const posterBuffer = await this.downloadPoster(detail.poster_path);
        posterUrl = await this.storage.uploadPoster(
          `${tmdbId}-${detail.title}.jpg`,
          posterBuffer,
        );
      } catch (err) {
        this.logger.warn(`Failed to upload poster for ${detail.title}: ${err}`);
      }
    }

    return this.movieRepo.upsertByTitle({
      title: detail.title,
      description: detail.overview,
      durationMinutes: detail.runtime || 120,
      rating: detail.vote_average ? `${detail.vote_average}/10` : undefined,
      originalLanguage: detail.original_language,
      releaseDate: detail.release_date ? new Date(detail.release_date) : undefined,
      posterUrl,
      status: 'CARTELERA',
    });
  }

  private async fetchTmdbDetail(tmdbId: number, apiKey: string): Promise<TmdbMovieDetail> {
    return new Promise((resolve, reject) => {
      const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}`;
      https
        .get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(err);
            }
          });
        })
        .on('error', reject);
    });
  }

  private async downloadPoster(posterPath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const url = `https://image.tmdb.org/t/p/w500${posterPath}`;
      https
        .get(url, (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
        })
        .on('error', reject);
    });
  }
}
