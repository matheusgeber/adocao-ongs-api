import { IsString, IsNotEmpty, IsInt, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoriaPergunta } from '@prisma/client';

export class CreatePerguntaDto {
    @ApiProperty({ example: 'Quantas horas por dia o animal ficará sozinho em casa?' })
    @IsString()
    @IsNotEmpty()
    texto: string;

    @ApiProperty({ enum: CategoriaPergunta, example: CategoriaPergunta.ROTINA })
    @IsEnum(CategoriaPergunta)
    @IsNotEmpty()
    categoria: CategoriaPergunta;

    @ApiProperty({ example: 3 })
    @IsInt()
    @IsNotEmpty()
    peso: number;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    ativa?: boolean;
}