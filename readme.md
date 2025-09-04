# 🎮 NextPlay

> **NextPlay** é uma aplicação que ajuda você a decidir **qual jogo zerar a seguir** na sua biblioteca da Steam.  
> Ele combina **críticas profissionais (Metacritic, OpenCritic)**, **avaliações da comunidade (Steam Reviews)**, **duração estimada (HowLongToBeat)** e suas **preferências pessoais** para gerar um ranking inteligente e explicável dos seus jogos.

---

## ✨ Funcionalidades

- 🔑 Login via **SteamID64** (ou autenticação OpenID simulada)
- 📥 Sincronização da biblioteca Steam
- ⚙️ Definição de preferências:
  - Gêneros e tags favoritas / indesejadas
  - Idioma (ex.: apenas jogos com PT-BR)
  - Compatibilidade (controller-friendly)
  - Janela de duração (curtos / médios / longos)
  - Mood do dia (história, relax, competitivo, desafio)
  - Pisos de qualidade (Metacritic, OpenCritic, Steam % positiva)
- 🏆 Recomendação de jogos **com ranking e justificativa**
- 👍👎 Sistema de feedback (Like, Dislike, Snooze) para o app aprender
- 📊 Histórico de feedbacks
- 🌙 Tema escuro por padrão (dark mode), com opção de claro

---

## 🛠️ Tecnologias

### Frontend
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (build rápido)
- [Material UI](https://mui.com/) (UI components)
- [React Router](https://reactrouter.com/) (navegação)
- [React Query](https://tanstack.com/query/latest) (cache de requisições)
- [Axios](https://axios-http.com/) (HTTP client)
- [Zod](https://zod.dev/) (validação de tipos)
- [Day.js](https://day.js.org/) (datas)

### Backend
- [.NET 8](https://dotnet.microsoft.com/) (Minimal API)
- [Entity Framework Core](https://learn.microsoft.com/ef/core/) + **SQLite** (persistência)
- [Quartz.NET](https://www.quartz-scheduler.net/) (jobs em background)
- [Serilog](https://serilog.net/) (logging estruturado)

### Integrações
- **Steam Web API** → biblioteca e conquistas
- **Steam Store API** → detalhes e reviews
- **RAWG API** → notas do Metacritic + metadados
- **OpenCritic API** → crítica profissional
- **HowLongToBeat** → duração estimada das campanhas

---

## 📂 Estrutura de pastas

