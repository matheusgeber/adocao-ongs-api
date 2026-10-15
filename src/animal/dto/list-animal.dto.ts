import { PaginacaoDto } from "../../common/dto/paginacao.dto.js";
import { IsEnum, IsOptional, IsString, IsUUID, IsBoolean } from "class-validator";
import { PorteAnimal } from "../../animal/entities/animal.entity.js";

export class ListAnimalDto extends PaginacaoDto {
    @IsOptional()
    @IsString()
    especie?: string;

    @IsOptional()
    @IsEnum(PorteAnimal, { message: "O porte do animal deve ser 'pequeno', 'medio' ou 'grande'" })
    porte?: string;

    @IsOptional()
    @IsString()
    raca?: string;

    @IsOptional()
    @IsBoolean()
    cadastrado?: boolean;

    @IsOptional()
    @IsUUID()
    abrigoId?: string;
}