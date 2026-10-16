import { IsOptional, IsString, IsBooleanString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../common/dto/paginacao.dto.js';

export class ListarPerguntasDto extends PaginacaoDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    categoria?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBooleanString()
    ativa?: string;
}