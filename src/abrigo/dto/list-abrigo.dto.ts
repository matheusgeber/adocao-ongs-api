import { IsOptional, IsString } from "class-validator";
import { PaginacaoDto } from "../../common/dto/paginacao.dto.js";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ListAbrigoDto extends PaginacaoDto {
    @ApiPropertyOptional({ example: 'Niterói' })
    @IsOptional()
    @IsString()
    cidade?: string;
    
    @ApiPropertyOptional({ example: 'bd98cc5b-6250-45ed-906a-2681deec5793' })
    @IsOptional()
    @IsString()
    ongId?: string;
}