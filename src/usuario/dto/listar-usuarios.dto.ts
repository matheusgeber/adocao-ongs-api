import { ApiPropertyOptional } from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginacaoDto } from '../../common/dto/paginacao.dto.js';

export class ListarUsuariosDto extends PaginacaoDto {
  @ApiPropertyOptional({ enum: Perfil })
  @IsOptional()
  @IsEnum(Perfil)
  perfil?: Perfil;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  ativo?: boolean;
}
