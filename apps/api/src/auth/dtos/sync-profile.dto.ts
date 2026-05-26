import { IsOptional, IsString, MinLength } from 'class-validator';

export class SyncProfileDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;
}
