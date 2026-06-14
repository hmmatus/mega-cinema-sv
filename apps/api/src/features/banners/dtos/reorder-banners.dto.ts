import { IsArray, IsInt, IsUUID, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItem {
  @IsUUID() id: string;
  @IsInt() @Min(0) position: number;
}

export class ReorderBannersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  banners: ReorderItem[];
}
