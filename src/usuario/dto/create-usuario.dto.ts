import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import {
  IsEmail,
  IsIn,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export const perfisCriaveis = [
  Perfil.ADMIN,
  Perfil.ADOTANTE,
  Perfil.VOLUNTARIO,
];

export class CreateUsuarioDto {
  @ApiProperty({ example: 'voluntario@patinhas.org' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({ example: 'Senha@123', minLength: 8, maxLength: 64 })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @MaxLength(64)
  senha: string;

  @ApiProperty({
    enum: perfisCriaveis,
    description: 'Usuários de ONG são criados em POST /ongs',
  })
  @IsIn(perfisCriaveis, {
    message: 'Perfil deve ser ADMIN, ADOTANTE ou VOLUNTARIO',
  })
  perfil: Perfil;

  @ApiPropertyOptional({
    description: 'Obrigatório quando o perfil é VOLUNTARIO',
  })
  @ValidateIf((o) => o.perfil === Perfil.VOLUNTARIO)
  @IsUUID('4', { message: 'Informe o id da ONG do voluntário' })
  ongId?: string;
}
