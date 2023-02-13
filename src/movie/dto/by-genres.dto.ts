import { IsArray, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class byGenresDto {
  @IsArray()
  @IsString({ each: true })
  genresIds: Types.ObjectId[];
}
