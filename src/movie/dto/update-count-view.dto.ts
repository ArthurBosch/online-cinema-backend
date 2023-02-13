import { IsString } from 'class-validator';

export class updateCountDto {
  @IsString()
  slug: string;
}
