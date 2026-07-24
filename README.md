# FOTOSSSURF

Site do fotógrafo de surf: álbuns, galeria com marca d'água, vendas digitais e pacotes WhatsApp.

## Deploy (Vercel)

1. Crie um banco grátis: [console.neon.tech](https://console.neon.tech) → New Project → copie a **Connection string** (`postgresql://...`)
2. Importe o repo em [vercel.com/new](https://vercel.com/new)
3. Em Environment Variables, defina:
   - `DATABASE_URL` → connection string do Neon
   - `NEXTAUTH_SECRET` → texto longo aleatório (ex. [generate-secret](https://generate-secret.vercel.app/32))
   - `AUTH_SECRET` → o **mesmo** valor
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` → credenciais do painel (opcional; padrão `admin@fotossurf.com` / `admin123`)
4. Deploy → abra a URL `*.vercel.app`

**Admin:** `/admin/login` com o e-mail e senha definidos acima.

> Se o login falhar, confira se `NEXTAUTH_SECRET` e `AUTH_SECRET` são idênticos. Opcional: `AUTH_URL` e `NEXT_PUBLIC_APP_URL` com a URL final do site.

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

Next.js · PostgreSQL (Neon) · Prisma · Auth.js · Mercado Pago · WhatsApp · Vercel
