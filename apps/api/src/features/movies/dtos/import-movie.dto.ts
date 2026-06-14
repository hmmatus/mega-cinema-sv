import { IsNumber, IsPositive } from 'class-validator';

export class ImportMovieDto {
  @IsNumber()
  @IsPositive()
  tmdbId!: number;
}
