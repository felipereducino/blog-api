<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Blog API — NestJS + Prisma + PostgreSQL

Production-ready starter with:

- **NestJS (Fastify)**, **Prisma**, **PostgreSQL (Docker)**
- Auth: **register / login / refresh / logout** (JWT access + rotating refresh via **httpOnly** cookie)
- **Users**: `GET /users/me`
- **Posts**: CRUD (author or admin can edit/delete; published list is public)
- Security: **argon2** hashing, **Helmet**, **rate limiting**, **validated envs**, **global validation pipe**
- DX: **Swagger** docs, Prisma Migrate, seed, Docker Compose

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Tech Stack & Rationale](#tech-stack--rationale)
- [Quickstart](#quickstart)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Database & Prisma](#database--prisma)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Users](#users)
  - [Posts](#posts)
- [Swagger (OpenAPI)](#swagger-openapi)
- [Security Notes](#security-notes)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)
- [License](#license)

---

## Prerequisites

- **Node.js 20+**
- **pnpm** (via Corepack):
  ```bash
  corepack enable && corepack prepare pnpm@latest --activate
  ```
- **Docker** (Desktop or Engine)
- Optional: **Postman** or `curl`

---

## Tech Stack & Rationale

- **NestJS + Fastify** → modular architecture with a fast HTTP stack.
- **Prisma** → type-safe ORM and migrations.
- **PostgreSQL** → reliable RDBMS, easy to run via Docker.
- **JWT** → short-lived access token + **rotating** refresh token (httpOnly cookie; server stores **hashed** RT).
- **argon2** → modern, memory-hard password hashing.
- **Helmet**, **rate limiting**, **env validation**, **DTO validation** → secure defaults.

---

## Quickstart

```bash
# 1) Install dependencies
pnpm install

# 2) Start the database (Docker)
docker compose up -d

# 3) Configure environment variables
cp .env.example .env   # if available, otherwise create .env (see section below)
# Edit .env with your secrets (JWT_* and DATABASE_URL)

# 4) Run migrations and seed data
pnpm prisma migrate dev --name init
pnpm seed

# 5) Start the API
pnpm start:dev

# 6) Open Swagger docs
# http://localhost:3000/api/docs
```

---

## Environment Variables

Create a `.env` file in the project root with the following keys. In production, manage secrets via a secret manager and never commit `.env`.

```ini
# App
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blog?schema=public"

# JWT (use long random strings; 32+ chars recommended)
JWT_ACCESS_SECRET="dev_access_secret_change_me"
JWT_ACCESS_TTL="15m"
JWT_REFRESH_SECRET="dev_refresh_secret_change_me"
JWT_REFRESH_TTL="7d"
```

> The app validates envs at boot using Joi. Startup will fail with a clear error if something is missing or invalid.

---

## Local Development

1. **Database (Docker Compose)**  
   The project includes a `docker-compose.yml`:

   ```yaml
   version: '3.9'
   services:
     db:
       image: postgres:16-alpine
       restart: unless-stopped
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
         POSTGRES_DB: blog
       ports:
         - '5432:5432'
       volumes:
         - pgdata:/var/lib/postgresql/data
   volumes:
     pgdata:
   ```

   Start it:

   ```bash
   docker compose up -d
   docker compose ps
   ```

2. **Install deps & generate Prisma client**

   ```bash
   pnpm install
   pnpm prisma generate
   ```

3. **Migrate & seed**

   ```bash
   pnpm prisma migrate dev --name init
   pnpm seed
   ```

4. **Run the server**

   ```bash
   pnpm start:dev
   ```

5. **Open docs**
   - Swagger UI: `http://localhost:3000/api/docs`

---

## Database & Prisma

- **Schema**: `prisma/schema.prisma`
- **Migrate (dev)**: `pnpm prisma migrate dev`
- **Reset DB (dev only)**: `pnpm prisma migrate reset`
- **Prisma Studio**: `pnpm dlx prisma studio`
- **Seed**: `pnpm seed`

Seed creates an **admin** user:

```
email:    admin@example.com
password: Admin@123456
```

---

## Project Structure

```
blog-api/
├─ docker-compose.yml
├─ .env
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.js
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  ├─ common/
│  │  ├─ decorators/get-user.decorator.ts
│  │  └─ types/jwt-payload.ts
│  ├─ prisma/
│  │  ├─ prisma.module.ts
│  │  └─ prisma.service.ts
│  ├─ auth/
│  │  ├─ auth.controller.ts
│  │  ├─ auth.module.ts
│  │  ├─ auth.service.ts
│  │  ├─ dto/
│  │  │  ├─ login.dto.ts
│  │  │  └─ register.dto.ts
│  │  └─ strategies/
│  │     ├─ jwt-access.strategy.ts
│  │     └─ jwt-refresh.strategy.ts
│  ├─ users/
│  │  ├─ users.controller.ts
│  │  ├─ users.module.ts
│  │  └─ users.service.ts
│  └─ posts/
│     ├─ dto/
│     │  ├─ create-post.dto.ts
│     │  └─ update-post.dto.ts
│     ├─ posts.controller.ts
│     ├─ posts.module.ts
│     └─ posts.service.ts
```

---

## API Reference

All routes are prefixed with **`/api`**.  
Authentication uses **Bearer access token**. The refresh token is set as an **httpOnly** cookie named `refresh_token`.

### Auth

#### `POST /api/auth/register`

- **Body**
  ```json
  {
    "email": "user1@example.com",
    "name": "User One",
    "password": "User@123456"
  }
  ```
  Rules: min 8 chars, at least 1 letter, 1 number, 1 special char.
- **Response `200`**
  ```json
  {
    "user": {
      "id": "...",
      "email": "user1@example.com",
      "name": "User One",
      "role": "USER"
    },
    "accessToken": "<JWT>"
  }
  ```
  Sets `refresh_token` cookie (httpOnly).

#### `POST /api/auth/login`

- **Body**
  ```json
  { "email": "user1@example.com", "password": "User@123456" }
  ```
- **Response `200`**: same shape as register. Sets `refresh_token` cookie.

#### `POST /api/auth/refresh`

- **Auth**: none (reads `refresh_token` cookie).
- **Response `200`**
  ```json
  {
    "user": {
      "id": "...",
      "email": "user1@example.com",
      "name": "User One",
      "role": "USER"
    },
    "accessToken": "<NEW_JWT>"
  }
  ```
  Rotates refresh cookie and server-side hashed RT.

#### `POST /api/auth/logout`

- **Auth**: Bearer access token.
- **Response `200`**
  ```json
  { "success": true }
  ```
  Clears server-side session and client cookie.

### Users

#### `GET /api/users/me`

- **Auth**: Bearer access token.
- **Response `200`**
  ```json
  {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "USER",
    "createdAt": "..."
  }
  ```

### Posts

#### `GET /api/posts`

- **Public**: list published posts (desc by createdAt).
- **Response**
  ```json
  [
    {
      "id": "...",
      "title": "...",
      "content": "...",
      "published": true,
      "authorId": "...",
      "createdAt": "..."
    }
  ]
  ```

#### `GET /api/posts/:id`

- **Public**: fetch a single post by id.
- **Response**: `200` or `404`.

#### `POST /api/posts`

- **Auth**: Bearer access token.
- **Body**
  ```json
  { "title": "Hello", "content": "My first post", "published": true }
  ```
- **Response `201`**
  ```json
  {
    "id": "...",
    "title": "Hello",
    "content": "My first post",
    "published": true,
    "authorId": "..."
  }
  ```

#### `PATCH /api/posts/:id`

- **Auth**: Bearer access token (author or ADMIN).
- **Body**: any subset of `{ "title", "content", "published" }`.
- **Response `200`**: updated post or errors `403/404`.

#### `DELETE /api/posts/:id`

- **Auth**: Bearer access token (author or ADMIN).
- **Response `200`**
  ```json
  { "success": true }
  ```

---

## Swagger (OpenAPI)

- **UI**: `http://localhost:3000/api/docs`
- Add `Authorization: Bearer <accessToken>` to test protected endpoints.
- For refresh flow testing, prefer Postman/Browser (Swagger may not send cookies cross-origin).

---

## Security Notes

- **Passwords** hashed with **argon2** (never stored in plaintext).
- **Access token** default TTL: `15m`.
- **Refresh token** default TTL: `7d`, stored as **httpOnly** cookie, **rotated** at each refresh; server stores **hashed** RT for verification and invalidation.
- **Helmet** enabled for secure headers.
- **Rate limiting**: global 100 req/min/IP; login endpoint 5 req/min/IP.
- **Global ValidationPipe** with `whitelist: true` & `forbidNonWhitelisted: true` to block unknown payload props.
- **Env validation** (Joi) prevents boot with invalid config.
- **CORS**: dev permits `http://localhost:*`; in production, restrict origins precisely and enable HTTPS (cookies use `secure: true`).

---

## Scripts

```bash
# development
pnpm start:dev

# build & production
pnpm build
pnpm start:prod

# prisma
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma migrate reset
pnpm dlx prisma studio

# seed database
pnpm seed
```

---

## Troubleshooting

**Port already in use**  
Change `PORT` in `.env`, or free the port:

```bash
lsof -i :3000   # mac/linux
kill -9 <pid>
```

**Database connection errors**

- Ensure Docker is running: `docker compose ps`
- Verify `DATABASE_URL` (`localhost:5432` by default)
- Re-run migrations: `pnpm prisma migrate dev`

**Migration drift**

- `pnpm prisma migrate dev` (create a new migration)
- Dev-only reset: `pnpm prisma migrate reset`

**401 on protected routes**

- Include `Authorization: Bearer <accessToken>` from `/auth/login` or `/auth/register`.
- For refresh, call `/api/auth/refresh` (browser/Postman sends cookie).

---

## Next Steps

- Device-based sessions (store multiple refresh tokens per user with userAgent/IP).
- Email verification & password reset.
- E2E tests (`@nestjs/testing`) with a dedicated Docker DB.
- Observability: health checks (`@nestjs/terminus`), metrics (Prometheus), tracing (OpenTelemetry).
- RBAC/ABAC policies and admin-only routes.
- CI/CD pipeline with lint, tests, and containerized deploy.

---

## License

MIT (or your preferred license).
