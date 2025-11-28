# 🚀 Guia de Deploy no Vercel - Magazine SRT

Este guia passo a passo explica como colocar o **Magazine SRT** no ar usando a Vercel. Como o projeto é "Full Stack" (Frontend + Backend), faremos o deploy em duas partes dentro da mesma conta Vercel.

> **⚠️ IMPORTANTE SOBRE O BANCO DE DADOS**
> O projeto atualmente usa **SQLite** (`dev.db`), que é um arquivo local. **SQLite NÃO funciona na Vercel** porque o sistema de arquivos é temporário.
> Para produção, você **PRECISA** usar um banco de dados na nuvem, como **Vercel Postgres**, **Neon** ou **Supabase**. Este guia cobre a configuração com **Vercel Postgres**.

---

## 📋 Pré-requisitos

1.  Conta no [GitHub](https://github.com) (onde o código já está).
2.  Conta na [Vercel](https://vercel.com).
3.  O código mais recente deve estar no GitHub (já fizemos isso!).

---

## 📦 Parte 1: Banco de Dados (Postgres)

Antes de subir o site, precisamos do banco de dados online.

1.  Acesse o [Dashboard da Vercel](https://vercel.com/dashboard).
2.  Vá em **Storage** > **Create Database** > **Postgres**.
3.  Dê um nome (ex: `magazine-srt-db`) e escolha a região mais próxima (ex: `Washington, D.C.` ou `São Paulo` se disponível).
4.  Clique em **Create**.
5.  Após criar, vá na aba **.env.local** do banco criado.
6.  Copie os valores, principalmente `POSTGRES_PRISMA_URL` e `POSTGRES_URL_NON_POOLING`. Você vai precisar deles.

---

## ⚙️ Parte 2: Deploy do Backend (Server)

Vamos subir a API primeiro.

1.  No Dashboard da Vercel, clique em **Add New...** > **Project**.
2.  Importe o repositório `magazine-srt`.
3.  **Configuração do Projeto**:
    *   **Project Name**: `magazine-srt-server` (ou outro nome de sua preferência).
    *   **Root Directory**: Clique em `Edit` e selecione a pasta `server`. **Isso é crucial!**
    *   **Framework Preset**: Deixe como `Other` ou `Express` se aparecer (geralmente `Other` funciona bem com nosso `vercel.json`).
4.  **Environment Variables (Variáveis de Ambiente)**:
    *   Adicione as variáveis necessárias:
        *   `DATABASE_URL`: Cole o valor de `POSTGRES_PRISMA_URL` que você pegou no passo 1.
        *   `DIRECT_URL`: Cole o valor de `POSTGRES_URL_NON_POOLING`.
        *   `JWT_SECRET`: Crie uma senha forte e secreta.
        *   `NODE_ENV`: `production`
5.  Clique em **Deploy**.

> **Nota**: O deploy pode falhar na primeira vez se o banco não estiver sincronizado. Se falhar, precisaremos rodar o comando de migração.
> Para corrigir o banco em produção:
> 1. Vá nas configurações do projeto na Vercel > **Build & Development Settings**.
> 2. No **Build Command**, coloque: `npx prisma generate && npx prisma migrate deploy && tsc`.
> 3. Redê o deploy.

Após o sucesso, a Vercel vai te dar uma URL (ex: `https://magazine-srt-server.vercel.app`). **Copie essa URL**.

---

## 🎨 Parte 3: Deploy do Frontend (Client)

Agora vamos subir o site que os usuários vão ver.

1.  Volte ao Dashboard da Vercel.
2.  Clique em **Add New...** > **Project**.
3.  Importe o **mesmo repositório** `magazine-srt` novamente.
4.  **Configuração do Projeto**:
    *   **Project Name**: `magazine-srt-client`.
    *   **Root Directory**: Clique em `Edit` e selecione a pasta `client`.
    *   **Framework Preset**: A Vercel deve detectar `Vite` automaticamente.
5.  **Environment Variables**:
    *   `VITE_API_URL`: Cole a URL do Backend que você copiou no passo anterior (ex: `https://magazine-srt-server.vercel.app`). **Não coloque a barra `/` no final**.
6.  Clique em **Deploy**.

---

## 🔄 Parte 4: Finalização

1.  Acesse a URL do seu Frontend (ex: `https://magazine-srt-client.vercel.app`).
2.  Teste o registro de um novo usuário.
3.  Se tudo der certo, seu banco Postgres está conectado e a aplicação está no ar! 🚀

### ⚠️ Ajuste Importante no Código (Se necessário)

Se você notar erros de conexão com o banco, pode ser necessário alterar o arquivo `server/prisma/schema.prisma` no seu código local e subir para o GitHub:

De:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Para:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

*Se fizer essa alteração, lembre-se de dar `git add .`, `git commit` e `git push`.*
