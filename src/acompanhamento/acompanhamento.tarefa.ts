import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AcompanhamentoService } from './acompanhamento.service.js';

@Injectable()
export class AcompanhamentoTarefa {
  private readonly logger = new Logger(AcompanhamentoTarefa.name);

  constructor(private readonly acompanhamentoService: AcompanhamentoService) {}

  // pra mostrar no vídeo dá pra trocar por CronExpression.EVERY_MINUTE
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async verificarAtrasados() {
    const total = await this.acompanhamentoService.marcarVencidos();
    if (total > 0) {
      this.logger.log(`${total} acompanhamento(s) marcado(s) como atrasado(s)`);
    }
  }
}
