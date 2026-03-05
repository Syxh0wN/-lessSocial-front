# lessSocial Frontend

Aplicacao web do lessSocial, feita com Next.js e React.

## Stack

- Next.js 16
- React 19
- NextAuth v5 (Google login)
- Tailwind CSS
- Axios

## Requisitos

- Node.js 20+
- npm 10+
- Backend do lessSocial rodando e acessivel

## Variaveis de ambiente

Crie `frontend/.env.local` com base no `frontend/.env.example`.

Exemplo:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_USE_MOCK_DATA=false
AUTH_SECRET=changeMeAuthSecret
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=changeMeGoogleClientId
GOOGLE_CLIENT_SECRET=changeMeGoogleClientSecret
```

### Significado de cada variavel

- `NEXT_PUBLIC_API_URL`: URL base da API backend
- `NEXT_PUBLIC_USE_MOCK_DATA`: ativa ou desativa dados mockados
- `AUTH_SECRET`: segredo do NextAuth
- `AUTH_URL`: URL publica do frontend
- `GOOGLE_CLIENT_ID`: client id do OAuth Google
- `GOOGLE_CLIENT_SECRET`: client secret do OAuth Google

## Instalacao

Na raiz do projeto:

```bash
npm install
```

## Rodar em desenvolvimento

Na raiz do projeto:

```bash
npm run dev:frontend
```

Ou direto no workspace frontend:

```bash
npm run dev --workspace frontend
```

A aplicacao sobe em:

`http://localhost:3000`

## Scripts uteis

No workspace frontend:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Fluxo de autenticacao

- Login principal via Google com NextAuth
- Token da API backend salvo na sessao
- Quando necessario, frontend chama rotas internas em `src/app/api/*` para fazer proxy para backend

## Estrutura resumida

- `src/app`: rotas de pagina e API routes
- `src/components`: componentes de UI
- `src/lib`: helpers, tipos e camada de API
- `public/uploads`: arquivos enviados no fluxo local

## Build de producao

No workspace frontend:

```bash
npm run build
npm run start
```

## Deploy no Vercel

1. Conecte o repositorio no Vercel
2. Defina `Root Directory` como `frontend` (se estiver em monorepo)
3. Configure as variaveis de ambiente de producao
4. Garanta que o backend esteja online antes do deploy final

Variaveis minimas no Vercel:

- `NEXT_PUBLIC_API_URL=https://SEU_BACKEND/api`
- `NEXT_PUBLIC_USE_MOCK_DATA=false`
- `AUTH_SECRET=...`
- `AUTH_URL=https://SEU_FRONTEND.vercel.app`
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`

No Google Cloud, configure tambem:

- Authorized JavaScript origins: `https://SEU_FRONTEND.vercel.app`
- Authorized redirect URI: `https://SEU_FRONTEND.vercel.app/api/auth/callback/google`

## Checklist de validacao

- Home abre sem erro
- Login Google funciona
- Feed carrega da API real
- Perfil carrega seguidores e seguindo
- Criar post e seguir usuarios funcionando
