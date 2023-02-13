import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({
    message: 'Did not recieve token or it is not a string',
  })
  refreshToken: string;
}
