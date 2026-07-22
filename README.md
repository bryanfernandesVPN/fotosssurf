# FOTOSSSURF

Site do fotógrafo de surf: álbuns diários, galeria com marca d'água, carrinho e venda de **download digital** via Mercado Pago (Pix/cartão).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- SQLite + Prisma (troque para Postgres em produção alterando `provider` e `DATABASE_URL`)
- Auth.js (credentials) para o painel admin
- Storage local (`/storage`) ou Cloudflare R2
- Mercado Pago Checkout Preferences + webhook

## Setup local

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

**Admin padrão** (definido no `.env` / seed):

- URL: `/admin`
- E-mail: `admin@fotossurf.com`
- Senha: `admin123` (troque em produção)

Sem `MERCADOPAGO_ACCESS_TOKEN`, o checkout em **development** marca o pedido como pago automaticamente para você testar downloads.

## Variáveis de ambiente

Veja [`.env.example`](.env.example):

| Variável | Uso |
|----------|-----|
| `DATABASE_URL` | SQLite `file:./dev.db` ou Postgres |
| `NEXTAUTH_SECRET` | Segredo da sessão admin |
| `ADMIN_*` | Credenciais criadas no seed |
| `R2_*` | Opcional — sem isso usa pasta `storage/` |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de produção ou teste MP |
| `NEXT_PUBLIC_APP_URL` | URL pública (webhooks e back_urls) |

## Fluxo do fotógrafo

1. Entrar em `/admin`
2. Criar álbum (data, praia, preço padrão)
3. Upload em lote das fotos do dia
4. Publicar o álbum
5. Surfers compram na galeria → Mercado Pago → download na página do pedido

## Produção (resumo)

1. Banco Postgres (Neon/Supabase) — mude `provider = "postgresql"` no `prisma/schema.prisma`
2. Bucket R2 + `R2_PUBLIC_URL` para previews
3. Conta Mercado Pago + webhook apontando para `https://seu-dominio/api/webhooks/mercadopago`
4. Deploy na Vercel com as env vars

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` / `npm start` — produção
- `npm run db:migrate` — migrations
- `npm run db:seed` — cria/atualiza admin
