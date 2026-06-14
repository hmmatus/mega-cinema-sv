import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { BranchStatus } from '@cinema/database';

export class ListLocationsQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) page?: number = 0;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @IsOptional() @IsEnum(BranchStatus) status?: BranchStatus;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(['name', 'city', 'createdAt', 'updatedAt']) sortBy?: 'name' | 'city' | 'createdAt' | 'updatedAt' = 'name';
  @IsOptional() @IsEnum(['asc', 'desc']) sortOrder?: 'asc' | 'desc' = 'asc';
}
