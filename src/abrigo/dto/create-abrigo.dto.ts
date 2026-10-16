import { IsString, Min } from "class-validator";

export class CreateAbrigoDto {
    @IsString()
    nome: string;
    
    @IsString()
    cidade: string;

    @Min(1, { message: "A capacidade do abrigo deve ser maior ou igual a 1" })
    capacidade: number;
}
