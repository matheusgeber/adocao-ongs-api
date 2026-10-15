import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdotanteDto {
    @ApiProperty({ example: 'João Silva' })
    @IsString()
    @IsNotEmpty()
    nome: string;

    @ApiProperty({ example: '12345678901', description: 'CPF com 11 dígitos numéricos' })
    @IsString()
    @Length(11, 11)
    cpf: string;

    @ApiProperty({ example: '11999999999' })
    @IsString()
    @IsNotEmpty()
    telefone: string;

    @ApiProperty({ example: 'id do usuario' })
    @IsString()
    @IsNotEmpty()
    usuarioId: string;
}