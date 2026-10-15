import { TipoRegistroSaude } from "../entities/registro-saude.entity.js";
import { IsDateString, IsEnum, IsString, IsUUID } from "class-validator";

export class CreateRegistroSaudeDto {
    @IsEnum(TipoRegistroSaude, { message: "O tipo de registro de saúde deve ser 'vacinação', 'exame' ou 'tratamento'" })
    tipo: string;

    @IsString()
    descricao: string;

    @IsDateString()
    data: string;

    @IsUUID()
    animalId: string;
}
