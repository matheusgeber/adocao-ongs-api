import { PaginacaoDto } from "../../common/dto/paginacao.dto.js";
import { IsEnum, IsOptional } from "class-validator";
import { TipoRegistroSaude } from "../../registro-saude/entities/registro-saude.entity.js";

export class ListAbrigoDto extends PaginacaoDto {
    @IsOptional()
    @IsEnum(TipoRegistroSaude, { message: "O tipo de registro de saúde deve ser 'vacinação', 'exame' ou 'tratamento'" })
    tipo?: string;
}