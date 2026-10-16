import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RevisarQuestionarioDto {
    @ApiProperty({ description: 'Pontuação final avaliada pela ONG' })
    @IsInt()
    @Min(0)
    pontuacao: number;

    @ApiPropertyOptional({ description: 'Observações adicionais da ONG' })
    @IsOptional()
    @IsString()
    observacaoOng?: string;
}