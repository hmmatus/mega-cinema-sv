import { IsUrl } from 'class-validator';

export class GoogleAuthDto {
  @IsUrl()
  redirectTo: string;
}
