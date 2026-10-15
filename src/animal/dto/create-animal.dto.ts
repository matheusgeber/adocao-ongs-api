import { Min, IsOptional, IsUUID, IsEnum, IsString, IsBoolean } from "class-validator";
import { PorteAnimal } from "../entities/animal.entity.js";

export class CreateAnimalDto {
    @IsString()
    nome: string;

    @IsString()
    especie: string;

    @IsEnum(PorteAnimal, { message: "O porte do animal deve ser 'pequeno', 'medio' ou 'grande'" })
    porte: string;

    @Min(0, { message: "A idade em meses deve ser maior ou igual a 0" })
    idadeMeses: number;

    @IsOptional()
    @IsString()
    raca: string;

    @IsBoolean()
    cadastrado: boolean;

    @IsUUID()
    abrigoId: string;
}
