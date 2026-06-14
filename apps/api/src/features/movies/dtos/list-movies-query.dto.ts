import { IsOptional, IsEnum, IsBoolean, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MovieRating, MovieStatus } from '@cinema/database';

export class ListMoviesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsEnum(MovieStatus)
  status?: MovieStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsEnum(MovieRating)
  rating?: MovieRating;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['releaseDate', 'createdAt', 'updatedAt', 'featured'])
  sortBy?: 'releaseDate' | 'createdAt' | 'updatedAt' | 'featured' = 'releaseDate';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
