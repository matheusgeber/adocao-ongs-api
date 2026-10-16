import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOngDto {
  @ApiProperty({ example: 'Patinhas Felizes' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string;

  @ApiProperty({
    example: '12345678000190',
    description: 'Somente os 14 dígitos',
  })
  @Matches(/^\d{14}$/, { message: 'O CNPJ deve ter 14 dígitos numéricos' })
  cnpj: string;

  @ApiProperty({
    example: '21987654321',
    description: 'DDD + número, só dígitos',
  })
  @Matches(/^\d{10,11}$/, {
    message: 'O telefone deve ter 10 ou 11 dígitos numéricos',
  })
  telefone: string;

  @ApiProperty({ example: 'Rio de Janeiro' })
  @IsString()
  @IsNotEmpty()
  cidade: string;

  @ApiProperty({
    example: 'contato@patinhas.org',
    description: 'Login do usuário da ONG',
  })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({ example: 'Senha@123', minLength: 8, maxLength: 64 })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @MaxLength(64)
  senha: string;
}
