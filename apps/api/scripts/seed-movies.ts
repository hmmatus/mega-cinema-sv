import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@cinema/database';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  runtime?: number;
  vote_average: number;
  original_language: string;
  release_date: string;
  poster_path: string | null;
}

interface TmdbDetail extends TmdbMovie {
  runtime: number;
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!TMDB_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing env: TMDB_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY',
  );
  process.exit(1);
}

const prisma = new PrismaClient();
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchTmdbPopular(page: number): Promise<TmdbMovie[]> {
  return new Promise((resolve, reject) => {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&language=en-US`;
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data).results);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}

async function fetchTmdbDetail(movieId: number): Promise<TmdbDetail> {
  return new Promise((resolve, reject) => {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`;
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

async function downloadPoster(posterPath: string): Promise<Buffer> {
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

async function uploadPoster(
  tmdbId: number,
  title: string,
  buffer: Buffer,
): Promise<string> {
  const hash = crypto.createHash('md5').update(buffer).digest('hex');
  const fileName = `${hash}-${tmdbId}-${title.slice(0, 20).replace(/\s+/g, '-')}.jpg`;
  const path = `posters/${fileName}`;

  const { error } = await supabase.storage.from('cinema-storage').upload(path, buffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });

  if (error) {
    console.warn(`Failed to upload poster for ${title}: ${error.message}`);
    return '';
  }

  const { data } = supabase.storage.from('cinema-storage').getPublicUrl(path);
  return data.publicUrl;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('🎬 Starting TMDB movie seed...');

  try {
    const allMovies: TmdbMovie[] = [];
    const pages = 5;

    console.log(`Fetching ${pages} pages from TMDB popular movies...`);
    for (let page = 1; page <= pages; page++) {
      const movies = await fetchTmdbPopular(page);
      allMovies.push(...movies);
      console.log(`✓ Page ${page}: fetched ${movies.length} movies (total: ${allMovies.length})`);
      await sleep(200);
    }

    console.log(`\nProcessing ${allMovies.length} movies in batches...`);
    const batchSize = 10;
    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < allMovies.length; i += batchSize) {
      const batch = allMovies.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (movie) => {
          try {
            const detail = await fetchTmdbDetail(movie.id);
            let posterUrl = '';

            if (detail.poster_path) {
              const posterBuffer = await downloadPoster(detail.poster_path);
              posterUrl = await uploadPoster(detail.id, detail.title, posterBuffer);
            }

            const existing = await prisma.movie.findFirst({
              where: { title: detail.title },
            });

            if (existing) {
              skipped++;
              return;
            }

            await prisma.movie.create({
              data: {
                title: detail.title,
                description: detail.overview,
                durationMinutes: detail.runtime || 120,
                rating: detail.vote_average ? `${detail.vote_average}/10` : null,
                originalLanguage: detail.original_language,
                releaseDate: detail.release_date ? new Date(detail.release_date) : null,
                posterUrl: posterUrl || null,
                trailerUrl: null,
                status: 'CARTELERA',
              },
            });
            inserted++;
          } catch (err) {
            console.error(`Error processing movie ${movie.title}: ${err}`);
          }
        }),
      );

      console.log(
        `✓ Processed batch ${Math.ceil(i / batchSize)}/${Math.ceil(allMovies.length / batchSize)}`,
      );
      await sleep(500);
    }

    console.log(`\n✅ Seed complete!`);
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Skipped (already exists): ${skipped}`);
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
