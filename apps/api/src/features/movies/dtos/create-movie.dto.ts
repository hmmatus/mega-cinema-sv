import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsArray,
  IsUrl,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MovieRating, MovieStatus, MovieVisibility } from '@cinema/database';

export class CreateMovieDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  duration: number;

  @IsEnum(MovieRating)
  rating: MovieRating;

  @IsDateString()
  releaseDate: string;

  @IsUrl()
  posterUrl: string;

  @IsOptional()
  @IsUrl()
  trailerUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  originalLanguage?: string;

  @IsOptional()
  @IsString()
  director?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cast?: string[];

  @IsOptional()
  @IsEnum(MovieStatus)
  status?: MovieStatus;

  @IsOptional()
  @IsEnum(MovieVisibility)
  visibility?: MovieVisibility;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
