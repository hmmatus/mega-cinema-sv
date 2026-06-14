import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { BannerStatus } from '@cinema/database';

export class ListBannersQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) page?: number = 0;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @IsOptional() @IsEnum(BannerStatus) status?: BannerStatus;
  @IsOptional() @IsEnum(['position', 'createdAt', 'updatedAt']) sortBy?: 'position' | 'createdAt' | 'updatedAt' = 'position';
  @IsOptional() @IsEnum(['asc', 'desc']) sortOrder?: 'asc' | 'desc' = 'asc';
}
