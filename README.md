# API de adoção de animais com ONGs

Trabalho da P1 de Programação Web (CEFET/RJ). API em NestJS com Prisma e PostgreSQL para ONGs,
abrigos, animais, adotantes, questionários, adoções, visitas e acompanhamentos pós-adoção.

## Como rodar

Precisa de Node 24 e de um PostgreSQL. Se não tiver um instalado, dá pra subir com Docker:

```bash
docker run --name adocao-pg -e POSTGRES_USER=adocao -e POSTGRES_PASSWORD=adocao -e POSTGRES_DB=adocao_ongs -p 5432:5432 -d postgres:16
```

Depois:

```bash
npm install
cp .env.example .env
```

No `.env`, ajuste o `DATABASE_URL` (por exemplo `postgresql://adocao:adocao@localhost:5432/adocao_ongs?schema=public`) e
preencha `JWT_SECRET` e `JWT_REFRESH_SECRET` com qualquer texto. Então:

```bash
npx prisma migrate deploy
npm run seed:usuarios
npm run seed:perguntas
npm run seed:adocoes
npm run start:dev
```

O Swagger fica em http://localhost:3000/api/docs. Faça login em `POST /auth/login`, copie o `accessToken`
e cole no botão Authorize.

## Usuários do seed

O `seed:usuarios` e o `seed:adocoes` criam usuários de cada perfil, todos com a senha `Senha@123`:

| Perfil | E-mail |
|---|---|
| ADMIN | admin@adocao.local |
| ONG | ong@adocao.local (ONG Patas Amigas, Rio de Janeiro) |
| ONG | ong2@adocao.local (ONG Focinhos do Bem, Niterói) |
| VOLUNTARIO | voluntario@adocao.local (vinculado à Patas Amigas) |
| ADOTANTE | ana@adocao.local, bruno@adocao.local, carla@adocao.local |

A Ana tem pontuação alta, o Bruno tem pontuação média (não pode adotar animal de porte grande) e a Carla tem um
acompanhamento atrasado, então está impedida de pedir novas adoções.

Errar a senha 5 vezes seguidas bloqueia a conta por 15 minutos.

## Autenticação

O login devolve um `accessToken`, válido por 15 minutos, e um `refreshToken`, válido por 7 dias. Quando o
`accessToken` vencer, chame `POST /auth/refresh` com o `refreshToken` para receber um par novo. Cada
`refreshToken` vale uma vez só. `POST /auth/logout` encerra a sessão.

Todas as rotas exigem token, exceto registro, login, refresh e a consulta de ONGs (`GET /ongs` e
`GET /ongs/:id`). Sem token a API responde 401; com um perfil sem permissão, 403.

## Modo cluster

Com `CLUSTER=true` no `.env`, a API sobe um processo por núcleo da CPU (ou a quantidade definida em
`CLUSTER_WORKERS`), e se um processo cair outro é iniciado no lugar. Use com:

```bash
npm run build
npm run start:prod
```

No `start:dev`, deixe `CLUSTER=false`.

## Comandos

- `npm run start:dev` sobe a API com watch
- `npm run build` compila
- `npm test` roda os testes
- `npm run lint` roda o oxlint

## Integrantes

- Joel Junior
- Daniel Rangel
- Matheus Geber
- Daniel Rodrigues
