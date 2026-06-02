import { IsString, IsOptional, IsEnum, IsInt, IsUrl, IsDateString, MaxLength, MinLength, Min } from 'class-validator';
import { BannerStatus, BannerTargetType } from '@cinema/database';

export class UpdateBannerDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(255) title?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsUrl() imageUrl?: string;
  @IsOptional() @IsUrl() mobileImageUrl?: string;
  @IsOptional() @IsUrl() targetUrl?: string;
  @IsOptional() @IsEnum(BannerTargetType) targetType?: BannerTargetType;
  @IsOptional() @IsString() targetId?: string;
  @IsOptional() @IsInt() @Min(0) position?: number;
  @IsOptional() @IsEnum(BannerStatus) status?: BannerStatus;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() metadata?: Record<string, unknown>;
}
