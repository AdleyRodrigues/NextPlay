# NextPlay

Uma aplicação web para descobrir seus próximos jogos favoritos baseado no seu perfil Steam.

## 🚀 Tecnologias

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Material UI (MUI)** - Biblioteca de componentes
- **React Router v6** - Navegação
- **React Query (TanStack Query)** - Gerenciamento de estado e cache
- **Axios** - Cliente HTTP
- **Zod** - Validação de schemas

## 📁 Estrutura do Projeto

```
src/
├── api/
│   ├── client.ts          # Funções mock de API
│   ├── http.ts            # Instância do axios
│   └── schemas.ts         # Schemas Zod
├── components/
│   ├── EmptyState/        # Componente para estados vazios
│   ├── GameCard/          # Card de jogo
│   ├── Header/            # Header da aplicação
│   └── PreferencesForm/   # Formulário de preferências
├── context/
│   └── SteamContext.tsx   # Contexto do Steam ID
├── hooks/
│   ├── useApi.ts          # Hooks para React Query
│   └── useToast.ts        # Hook para notificações
├── pages/
│   ├── History/           # Página de histórico
│   ├── Onboarding/        # Página de onboarding
│   ├── Ranking/           # Página de ranking
│   └── Settings/          # Página de configurações
├── routes/
│   └── AppRoutes.tsx      # Definição de rotas
├── theme/
│   └── index.ts           # Configuração de tema
├── utils/
│   └── format.ts          # Utilitários de formatação
├── App.tsx                # Componente principal
└── main.tsx               # Entry point
```

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:

   ```bash
   pnpm install
   ```

3. Configure as variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

4. Execute o projeto:

   ```bash
   pnpm dev
   ```

## 🎨 Funcionalidades

- **Tema escuro/claro** - Toggle entre temas
- **Autenticação Steam** - Login com Steam ID
- **Recomendações personalizadas** - Baseadas no perfil Steam
- **Histórico de jogos** - Visualização dos jogos jogados
- **Configuração de preferências** - Personalização das recomendações
- **Feedback de jogos** - Sistema de like/dislike

## 📱 Rotas

- `/onboarding` - Página inicial para configurar Steam ID
- `/` - Página principal com recomendações
- `/history` - Histórico de jogos
- `/settings` - Configurações e preferências

## 🔧 Desenvolvimento

- **pnpm dev** - Inicia o servidor de desenvolvimento
- **pnpm build** - Gera build de produção
- **pnpm preview** - Preview do build de produção

## 📝 Licença

Este projeto está sob a licença MIT.
