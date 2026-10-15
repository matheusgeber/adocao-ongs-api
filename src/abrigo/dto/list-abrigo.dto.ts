import { IsOptional, IsString } from "class-validator";
import { PaginacaoDto } from "../../common/dto/paginacao.dto.js";

export class ListAbrigoDto extends PaginacaoDto {
    @IsOptional()
    @IsString()
    cidade?: string;
}