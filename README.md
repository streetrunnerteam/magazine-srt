# 💎 Magazine SRT - Plataforma de Comunidade Exclusiva

![Magazine SRT Banner](client/public/vite.svg) <!-- Substituir por um banner real se houver -->

> Uma plataforma social premium focada em exclusividade, gamificação e interação para membros da elite Magazine e SRT.

## 📋 Sobre o Projeto

O **Magazine SRT** é uma aplicação web completa (Full Stack) desenvolvida para oferecer uma experiência de rede social privada e gamificada. A plataforma conecta membros através de um feed interativo, stories, e um sistema robusto de recompensas e níveis.

O diferencial do projeto é seu design sofisticado ("Luxurious UI") e a integração profunda de mecânicas de jogos (Gamification) para engajar os usuários, recompensando interações com moedas virtuais (**Zions**), experiência (**XP**) e **Conquistas**.

## 🚀 Funcionalidades Principais

### 🌟 Experiência Social
- **Feed Interativo**: Postagens com suporte a imagens e vídeos, curtidas e comentários em tempo real.
- **Stories**: Compartilhamento de momentos temporários com visualização imersiva.
- **Perfis Personalizados**: Customização de avatar, capa de perfil e bio.
- **Sistema de Amizades**: Envio e aceitação de solicitações de amizade.

### 🎮 Gamificação Avançada
- **Economia Virtual (Zions)**: Moeda ganha através de engajamento diário e interações.
- **Sistema de Níveis e XP**: Barra de progresso e níveis que desbloqueiam prestígio.
- **Conquistas (Badges)**: Medalhas desbloqueáveis por ações específicas na plataforma.
- **Ranking Global**: Tabela de liderança competitiva entre os membros.
- **Bônus Diário**: Sistema de recompensas progressivas por login consecutivo (Streak).

### 💎 Assinaturas e Exclusividade
- **Membros Magazine**: Acesso padrão à comunidade e funcionalidades.
- **Membros SRT (Elite)**: Acesso premium com visual exclusivo (tema diferenciado), destaque no ranking e benefícios adicionais.
- **Temas Dinâmicos**: Suporte completo a **Modo Claro** e **Modo Escuro**, com paletas de cores específicas para cada tipo de assinatura (Dourado para Magazine, Vermelho/Preto para SRT).

### 🛡️ Painel Administrativo
- **Gestão de Conteúdo**: Criação de postagens oficiais e anúncios dinâmicos.
- **Anúncios Dinâmicos**: Cards de novidades configuráveis que aparecem no feed dos usuários.
- **Moderação**: Ferramentas para manter a qualidade da comunidade.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as tecnologias mais modernas do ecossistema JavaScript/TypeScript.

### Frontend (Client)
- **React 18**: Biblioteca principal para construção da interface.
- **Vite**: Build tool de alta performance.
- **TypeScript**: Tipagem estática para maior segurança e manutenibilidade.
- **TailwindCSS**: Framework de estilização utilitária para design responsivo e customizável.
- **Framer Motion**: Biblioteca para animações complexas e fluidas.
- **Lucide React**: Ícones modernos e leves.
- **Axios**: Cliente HTTP para comunicação com a API.

### Backend (Server)
- **Node.js & Express**: Servidor robusto e escalável.
- **Prisma ORM**: Manipulação de banco de dados moderna e type-safe.
- **SQLite**: Banco de dados relacional (ambiente de desenvolvimento).
- **TypeScript**: Código backend tipado.
- **Multer**: Upload de arquivos.
- **JWT (JSON Web Tokens)**: Autenticação segura.

## 📦 Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente.

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Git**

### 1. Clone o Repositório
```bash
git clone https://github.com/streetrunnerteam/magazine-srt.git
cd magazine-srt
```

### 2. Configuração do Backend (Server)
```bash
cd server
npm install

# Configure as variáveis de ambiente (crie um arquivo .env baseado no exemplo, se houver)
# Exemplo básico de .env:
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="sua_chave_secreta_super_segura"
# PORT=3001

# Execute as migrações do banco de dados
npx prisma migrate dev --name init

# (Opcional) Popule o banco com dados iniciais
npx prisma db seed

# Inicie o servidor
npm run dev
```
*O servidor rodará em `http://localhost:3001`*

### 3. Configuração do Frontend (Client)
Abra um novo terminal na raiz do projeto:
```bash
cd client
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```
*O frontend rodará em `http://localhost:5173` (ou porta similar)*

## 📱 Guia de Uso

1.  **Registro/Login**: Crie uma conta ou faça login.
2.  **Onboarding**: Complete o tour de boas-vindas.
3.  **Interaja**: Curta posts, faça comentários e ganhe seus primeiros Zions.
4.  **Explore**: Visite a aba Social para encontrar amigos.
5.  **Perfil**: Personalize seu perfil clicando no seu avatar.

## 🤝 Contribuição

Contribuições são bem-vindas! Se você deseja melhorar o Magazine SRT:

1.  Faça um **Fork** do projeto.
2.  Crie uma **Branch** para sua feature (`git checkout -b feature/NovaFeature`).
3.  Faça o **Commit** (`git commit -m 'Adicionando nova feature'`).
4.  Faça o **Push** (`git push origin feature/NovaFeature`).
5.  Abra um **Pull Request**.

## 📄 Licença

Este projeto é proprietário e desenvolvido para o **Street Runner Team**. Todos os direitos reservados.

---
Desenvolvido com 💜 e ☕ pela equipe de tecnologia SRT.
