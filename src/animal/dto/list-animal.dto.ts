import { PaginacaoDto } from "../../common/dto/paginacao.dto.js";
import { IsEnum, IsOptional, IsString, IsUUID, IsBoolean } from "class-validator";
import { PorteAnimal, StatusAnimal } from "../../animal/entities/animal.entity.js";

export class ListAnimalDto extends PaginacaoDto {
    @IsOptional()
    @IsString()
    especie?: string;

    @IsOptional()
    @IsEnum(PorteAnimal, { message: "O porte do animal deve ser 'pequeno', 'medio' ou 'grande'" })
    porte?: PorteAnimal;

    @IsOptional()
    @IsString()
    raca?: string;

    @IsOptional()
    @IsBoolean()
    cadastrado?: boolean;

    @IsOptional()
    @IsUUID()
    abrigoId?: string;

    @IsOptional()
    @IsUUID()
    ongId?: string;

    @IsOptional()
    @IsEnum(StatusAnimal, { message: "O status do animal deve ser 'disponivel', 'adotado' ou 'inativo'" })
    status?: StatusAnimal;
}