# FOTOSSSURF

Site do fotógrafo de surf: álbuns, galeria com marca d'água, vendas digitais e pacotes WhatsApp.

## Deploy com 1 clique (Netlify)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/bryanfernandesVPN/fotosssurf)

### Antes do clique (2 minutos — pelo celular/4G)

1. Crie um banco grátis: [console.neon.tech](https://console.neon.tech) → New Project → copie a **Connection string** (`postgresql://...`)
2. Clique no botão **Deploy to Netlify** acima
3. Entre com GitHub e autorize o repo
4. Cole:
   - `DATABASE_URL` → connection string do Neon
   - `NEXTAUTH_SECRET` → qualquer texto longo aleatório (ex. gerado em https://generate-secret.vercel.app/32)
   - `AUTH_SECRET` → o mesmo valor
5. Deploy → aguarde → abra a URL `*.netlify.app`

**Admin:** `fotosssurf@gmail.com` / `fotosssurf@`

> Depois do 1º deploy, em Site settings → Environment variables, confira se `URL` do Netlify existe (o site usa automaticamente). Se o login admin falhar, adicione `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` com a URL final do site.

## Rodar local

Precisa da mesma `DATABASE_URL` do Neon (Postgres). Sem Docker.

```bash
npm install
cp .env.example .env
# edite .env e cole DATABASE_URL do Neon
npx prisma migrate deploy
npm run db:seed
npm run dev
```

## Stack

Next.js · PostgreSQL (Neon) · Prisma · Auth.js · Mercado Pago · WhatsApp
