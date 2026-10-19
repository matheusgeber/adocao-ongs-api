import { Min, IsOptional, IsUUID, IsEnum, IsString, IsBoolean } from "class-validator";
import { PorteAnimal, StatusAnimal } from "../entities/animal.entity.js";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAnimalDto {
    @ApiProperty({ example: 'Alfredo' })
    @IsString()
    nome: string;

    @ApiProperty({ example: 'CAO' })
    @IsString()
    especie: string;

    
    @ApiProperty({ example: 'medio' })
    @IsEnum(PorteAnimal, { message: "O porte do animal deve ser 'pequeno', 'medio' ou 'grande'" })
    porte: PorteAnimal;

    @ApiProperty({ example: 6 })
    @Min(0, { message: "A idade em meses deve ser maior ou igual a 0" })
    idadeMeses: number;

    @ApiProperty({ example: 'Corgi' })
    @IsOptional()
    @IsString()
    raca: string;

    @ApiProperty({ example: false })
    @IsBoolean()
    castrado: boolean;

    @ApiProperty({ example: 'adc85409-80b2-48f4-b41e-8b1974ae7772' })
    @IsUUID()
    abrigoId: string;

    @ApiProperty({ example: 'em_processo' })
    @IsEnum(StatusAnimal, { message: "O status do animal deve ser 'disponivel', 'em_processo' ou 'adotado'" })
    status: StatusAnimal;
}
