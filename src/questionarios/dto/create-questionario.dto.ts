import { IsString, IsArray, ValidateNested, IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RespostaItemDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    perguntaId: string;

    @ApiProperty()
    @IsInt()
    valor: number;
}

export class CreateQuestionarioDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    adotanteId: string;

    @ApiProperty({ type: [RespostaItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RespostaItemDto)
    respostas: RespostaItemDto[];
}