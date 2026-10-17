import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

process.loadEnvFile();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API de Adoção de Animais - ONGs')
    .setDescription('ONGs, abrigos, animais, adotantes, processos de adoção, visitas, termos e acompanhamentos.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documento = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, documento);

  await app.listen(process.env.PORT ?? 3000);
}

function iniciarCluster() {
  const workers = Number(process.env.CLUSTER_WORKERS) || availableParallelism();
  console.log(`Processo principal ${process.pid} iniciando ${workers} workers`);

  for (let i = 0; i < workers; i++) cluster.fork();

  cluster.on('exit', (worker, codigo) => {
    console.log(`Worker ${worker.process.pid} encerrou (código ${codigo}). Iniciando outro`);
    cluster.fork();
  });
}

if (process.env.CLUSTER === 'true' && cluster.isPrimary) {
  iniciarCluster();
} else {
  bootstrap();
}
