# Loja do Lula Argentina

Aplicação independente da Loja do Lula na Argentina.

## Áreas

- `/`: vitrine principal em português.
- `/es`: vitrine principal em espanhol.
- `/loja/catalogo`: catálogo completo.
- `/reservar`: formulário de reserva.
- `/admin`: administração exclusiva de produtos, estoque e reservas.

## Configuração

Copie `.env.example` para `.env.local` e configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `STORE_TEAM_EMAIL` — atualmente `lojadolula13@gmail.com`
- `RESEND_API_KEY`
- `STORE_RESEND_FROM_EMAIL`
- chaves do Cloudflare Turnstile

## Banco de dados

O arquivo `supabase/migrations/20260723_store_initial.sql` cria apenas as estruturas da Loja:

- produtos;
- reservas;
- perfis administrativos;
- controle antispam;
- armazenamento de imagens.

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

## Verificação

```bash
pnpm build
```
