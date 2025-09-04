# Arquitetura Geral - NextPlay

## Visão Geral

O NextPlay é uma aplicação de recomendação de jogos composta por:

- **Frontend**: React + TypeScript + Material UI
- **Backend**: .NET 8 Minimal API + EF Core
- **Database**: SQLite
- **Integrações**: Steam, RAWG, OpenCritic, HowLongToBeat

```mermaid
graph TB
    subgraph "Frontend (React + TypeScript)"
        UI[Landing Page]
        Filter[LandingFilter]
        Cards[GameCard Components]
        State[useLandingState Hook]
        API_Client[API Client]
    end
    
    subgraph "Backend (.NET 8 Minimal API)"
        Program[Program.cs<br/>Entry Point & DI]
        Endpoints[Endpoints/<br/>RecommendationsEndpoints<br/>UserEndpoints<br/>RankingEndpoints<br/>DevEndpoints<br/>RawgEndpoints<br/>DiscoverEndpoints]
        Services[Application/Services/<br/>RecommendationService<br/>UserService<br/>RankingService<br/>CompositeCatalogService]
        Providers[Infrastructure/Providers/<br/>IgdbService<br/>RawgService<br/>SteamStoreService<br/>SteamApiService<br/>HltbService]
        Cache[Memory Cache<br/>RAWG Data Caching]
        DB_Context[Infrastructure/Ef/<br/>NextPlayDbContext]
    end
    
    subgraph "DTOs & Domain"
        DTOs[Api/DTOs/<br/>Request & Response DTOs<br/>RankingRequest & RankingResponse]
        Entities[Domain/Entities/<br/>Game, Scores, Hltb<br/>UserPrefs, Feedback]
    end
    
    subgraph "Database (SQLite)"
        Games[Games Table]
        Scores[Scores Table]
        HLTB[HLTB Table]
        UserPrefs[UserPrefs Table]
        Feedback[Feedback Table]
    end
    
    subgraph "External APIs"
        IGDB[IGDB API<br/>Principal Discovery<br/>OAuth via Twitch]
        RAWG[RAWG API<br/>Fallback Discovery<br/>Metacritic, Gêneros]
        Steam[Steam API]
        OpenCritic[OpenCritic API]
        HowLong[HowLongToBeat]
    end
    
    UI --> Filter
    Filter --> State
    State --> API_Client
    API_Client --> Program
    
    Program --> Endpoints
    Endpoints --> Services
    Services --> Providers
    Services --> DB_Context
    
    Providers --> Cache
    
    Endpoints --> DTOs
    DB_Context --> Entities
    
    Providers --> IGDB
    Providers --> RAWG
    Providers --> Steam
    Providers --> OpenCritic
    Providers --> HowLong
    
    DB_Context --> Games
    DB_Context --> Scores
    DB_Context --> HLTB
    DB_Context --> UserPrefs
    DB_Context --> Feedback
    
    Endpoints --> API_Client
    
    style Program fill:#e3f2fd,color:#000
    style Endpoints fill:#f3e5f5,color:#000
    style Services fill:#e8f5e8,color:#000
    style Providers fill:#fff3e0,color:#000
    style Cache fill:#ffe0b2,color:#000
    style IGDB fill:#e8f5e8,color:#000
    style RAWG fill:#e1f5fe,color:#000
```

## Componentes Principais

### Frontend

- **Landing Page**: Interface principal com filtros
- **LandingFilter**: Componente de filtros (vibe, duração, etc.)
- **GameCard**: Cards de jogos recomendados
- **useLandingState**: Hook de estado dos filtros
- **API Client**: Cliente HTTP para comunicação com backend

### Backend

- **Program.cs**: Entry point, configuração de DI e middleware
- **Endpoints**: Classes organizadas por domínio (Recommendations, User, Dev)
- **Services**: Lógica de negócio (RecommendationService, UserService, RankingService, CompositeCatalogService)
- **Providers**: Integrações com APIs externas (IgdbService, RawgService, SteamStoreService, SteamApiService, HltbService)
- **Memory Cache**: Cache em memória para tokens OAuth e resultados de descoberta
- **EF Core DbContext**: Acesso a dados com Entity Framework

### Database

- **Games**: Jogos da Steam com metadados
- **Scores**: Notas do Metacritic, OpenCritic, Steam
- **HLTB**: Durações do HowLongToBeat
- **UserPrefs**: Preferências do usuário
- **Feedback**: Likes/Dislikes/Snooze do usuário

## Estrutura de Pastas Atual

```
NextPlay.Api/
├── Program.cs                    # Entry point e configuração
├── Endpoints/                    # Minimal API endpoints organizados
│   ├── RecommendationsEndpoints.cs
│   ├── UserEndpoints.cs
│   ├── RankingEndpoints.cs
│   ├── DevEndpoints.cs
│   ├── RawgEndpoints.cs
│   └── DiscoverEndpoints.cs
├── Application/                  # Camada de aplicação
│   ├── Catalog/
│   │   ├── DiscoverDtos.cs
│   │   └── CompositeCatalogService.cs
│   └── Services/
│       ├── RecommendationService.cs
│       ├── UserService.cs
│       └── RankingService.cs
├── Api/                          # DTOs e contratos
│   └── DTOs/
│       ├── RecommendRequest.cs
│       ├── RecommendationsResponse.cs
│       ├── RankingRequest.cs
│       ├── RankingResponse.cs
│       ├── UserPrefsRequest.cs
│       └── FeedbackRequest.cs
├── Domain/                       # Entidades de domínio
│   └── Entities/
│       ├── Game.cs
│       ├── Scores.cs
│       ├── Hltb.cs
│       ├── UserPrefs.cs
│       └── Feedback.cs
└── Infrastructure/               # Infraestrutura
    ├── Ef/
    │   ├── NextPlayDbContext.cs
    │   └── NextPlayDbContextFactory.cs
    └── Providers/
        ├── IIgdbService.cs
        ├── IgdbService.cs
        ├── IgdbOptions.cs
        ├── IRawgService.cs
        ├── RawgService.cs
        ├── RawgOptions.cs
        ├── SteamStoreService.cs
        ├── SteamApiService.cs
        └── HltbService.cs
```

## Fluxo de Dados

### Sequência de Camadas

1. **Frontend** → HTTP Request
2. **Program.cs** → Roteamento
3. **Endpoints** → Validação e orquestração
4. **Services** → Lógica de negócio
5. **Providers** → APIs externas (se necessário)
6. **DbContext** → Acesso a dados
7. **Database** → Persistência
