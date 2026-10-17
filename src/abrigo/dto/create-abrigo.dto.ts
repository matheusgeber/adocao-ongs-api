import { ApiProperty } from "@nestjs/swagger";
import { IsString, Min } from "class-validator";

export class CreateAbrigoDto {
    
    @ApiProperty({ example: 'Abrigo Bolinha' })
    @IsString()
    nome: string;
    
    @ApiProperty({ example: 'São Paulo' })
    @IsString()
    cidade: string;

    @ApiProperty({ example: 50 }) 
    @Min(1, { message: "A capacidade do abrigo deve ser maior ou igual a 1" })
    capacidade: number;
}
