import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../common/dto/paginacao.dto.js';

export class ListarQuestionariosDto extends PaginacaoDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    adotanteId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    pontuacaoMinima?: number;
}