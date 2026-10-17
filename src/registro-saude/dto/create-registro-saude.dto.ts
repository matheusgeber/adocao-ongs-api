import { ApiProperty } from "@nestjs/swagger";
import { TipoRegistroSaude } from "../entities/registro-saude.entity.js";
import { IsDateString, IsEnum, IsString, IsUUID } from "class-validator";

export class CreateRegistroSaudeDto {
    
    @ApiProperty({ enum: TipoRegistroSaude, example: TipoRegistroSaude.VACINA })
    @IsEnum(TipoRegistroSaude, { message: "O tipo de registro de saúde deve ser 'vacinação', 'exame' ou 'tratamento'" })
    tipo: TipoRegistroSaude;

    @ApiProperty({ example: 'O animal precisa de uma vacinação anual' })
    @IsString()
    descricao: string;

    @ApiProperty({ example: '2026-10-17' })
    @IsDateString()
    data: string;

    @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
    @IsUUID()
    animalId: string;
}
