import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token recebido no login' })
  @IsJWT({ message: 'Refresh token em formato inválido' })
  refreshToken: string;
}
