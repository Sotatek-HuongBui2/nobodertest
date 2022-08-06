import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ required: true, description: 'Signature' })
  token: string;

  @ApiProperty({ required: true, description: 'Refresh Token' })
  refreshToken: string;
}
