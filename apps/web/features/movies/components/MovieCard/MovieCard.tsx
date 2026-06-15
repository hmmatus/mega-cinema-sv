import Link from 'next/link';
import Image from 'next/image';
import { formatDuration } from './utils';
import type { MovieCardProps } from './types';

const BADGE: Record<string, { label: string; className: string } | undefined> = {
  RELEASED: {
    label: 'ESTRENO',
    className: 'bg-[#0047AB] text-white',
  },
  PRERELEASE: {
    label: 'Preventa',
    className: 'border border-[#0047AB] text-[#0047AB] bg-white',
  },
};

export function MovieCard({ movie }: MovieCardProps) {
  const badge = BADGE[movie.status];
  const genre = movie.genres[0] ?? '';
  const meta = [genre, formatDuration(movie.durationMinutes)].filter(Boolean).join(' · ');

  return (
    <Link
      href={`/peliculas/${movie.id}`}
      className="group flex flex-col gap-2"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-[#F1F5F9]">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F1F5F9]">
            <svg
              className="w-12 h-12 text-[#CBD5E1]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
          </div>
        )}
        {badge && (
          <span
            className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${badge.className}`}
          >
            {badge.label}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-0.5">
        <h3 className="text-sm font-semibold text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#0047AB] transition-colors">
          {movie.title}
        </h3>
        {meta && (
          <p className="text-xs text-[#64748B]">{meta}</p>
        )}
      </div>
    </Link>
  );
}
