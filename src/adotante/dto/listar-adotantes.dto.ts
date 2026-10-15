import { IsOptional, IsString, IsBooleanString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../common/dto/paginacao.dto.js';

export class ListarAdotantesDto extends PaginacaoDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    nome?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBooleanString()
    bloqueado?: string;
}