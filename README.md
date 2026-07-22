# FOTOSSSURF

Site do fotógrafo de surf: álbuns diários, galeria com marca d'água, carrinho e venda de **download digital** via Mercado Pago (Pix/cartão).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- Auth.js (credentials) para o painel admin
- Storage local (`/storage`), Cloudflare R2 ou Vercel Blob
- Mercado Pago Checkout Preferences + webhook

## Setup local

```bash
npm install
cp .env.example .env
docker compose up -d
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Admin: ver `ADMIN_EMAIL` / `ADMIN_PASSWORD` no `.env`.

## Deploy no Render (URL gratuita)

1. Crie um Postgres gratuito em [Neon](https://console.neon.tech) e copie a `DATABASE_URL`
2. Abra o deploy: [Deploy no Render](https://render.com/deploy?repo=https://github.com/bryanfernandesVPN/fotosssurf)
3. No Render, preencha:
   - `DATABASE_URL` — string do Neon
   - `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` — URL do serviço (ex. `https://fotosssurf.onrender.com`)
4. Após o primeiro deploy, o seed cria o admin automaticamente

## Variáveis de ambiente

Veja [`.env.example`](.env.example).

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` / `npm start` — produção local
- `npm run start:prod` — migrate + seed + start (Render)
- `npm run db:migrate` / `npm run db:seed`
