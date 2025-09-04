# Modelo de Dados - NextPlay

## Diagrama Entidade-Relacionamento

```mermaid
erDiagram
    Game {
        int AppId PK "Steam App ID"
        string Name
        string Tags "Comma-separated"
        string Genres "Comma-separated"
        bool ControllerFriendly
        string Languages "Comma-separated"
        int ReleaseYear
    }
    
    Scores {
        int AppId PK,FK "References Game.AppId"
        int Metacritic "0-100"
        int OpenCritic "0-100"
        int SteamPositivePct "0-100"
        datetime UpdatedAt
    }
    
    Hltb {
        int AppId PK,FK "References Game.AppId"
        int MainMin "Main story in minutes"
        int MainExtraMin "Main + Extras"
        int CompletionistMin "100% completion"
        datetime UpdatedAt
    }
    
    Ownership {
        int Id PK
        string SteamId64 FK "User Steam ID"
        int AppId FK "References Game.AppId"
        int PlaytimeMin "Total playtime"
        datetime LastPlayed
        float AchievementPct "0.0-1.0"
    }
    
    UserPrefs {
        string SteamId64 PK "User Steam ID"
        string LikedTags "Comma-separated"
        string BlockedTags "Comma-separated"
        string LikedGenres "Comma-separated"
        bool PtbrOnly
        bool ControllerPreferred
        int MinMainH "Minimum hours"
        int MaxMainH "Maximum hours"
        int MetacriticMin "Quality floor"
        int OpenCriticMin "Quality floor"
        int SteamPositiveMin "Quality floor"
        datetime UpdatedAt
    }
    
    Feedback {
        int Id PK
        string SteamId64 FK "User Steam ID"
        int AppId FK "References Game.AppId"
        string Action "Like/Dislike/Snooze"
        datetime CreatedAt
    }
    
    Game ||--o| Scores : "has"
    Game ||--o| Hltb : "has"
    Game ||--o{ Ownership : "owned by users"
    Game ||--o{ Feedback : "receives feedback"
    UserPrefs ||--o{ Ownership : "user owns games"
    UserPrefs ||--o{ Feedback : "user gives feedback"
```

## Entidades Detalhadas

### 🎮 Game

**Entidade central** que representa um jogo da Steam.

- `AppId`: ID único do jogo na Steam (Primary Key)
- `Name`: Nome do jogo
- `Tags`: Tags do jogo (armazenadas como string separada por vírgulas)
- `Genres`: Gêneros (armazenados como string separada por vírgulas)
- `ControllerFriendly`: Se suporta controle
- `Languages`: Idiomas suportados
- `ReleaseYear`: Ano de lançamento

### 📊 Scores

**Notas e avaliações** do jogo de diferentes fontes.

- `AppId`: FK para Game (também PK)
- `Metacritic`: Nota do Metacritic (0-100)
- `OpenCritic`: Nota do OpenCritic (0-100)
- `SteamPositivePct`: Porcentagem de reviews positivas na Steam
- `UpdatedAt`: Quando foi atualizado pela última vez

### ⏱️ Hltb (HowLongToBeat)

**Durações de gameplay** para diferentes estilos de jogo.

- `AppId`: FK para Game (também PK)
- `MainMin`: História principal em minutos
- `MainExtraMin`: Principal + extras em minutos
- `CompletionistMin`: Completar 100% em minutos
- `UpdatedAt`: Quando foi atualizado

### 👤 Ownership

**Relacionamento** entre usuários e jogos que possuem.

- `Id`: Primary Key
- `SteamId64`: ID Steam do usuário
- `AppId`: FK para Game
- `PlaytimeMin`: Tempo total jogado em minutos
- `LastPlayed`: Quando jogou pela última vez
- `AchievementPct`: Porcentagem de conquistas (0.0-1.0)

### ⚙️ UserPrefs

**Preferências personalizadas** de cada usuário.

- `SteamId64`: ID Steam do usuário (PK)
- `LikedTags`: Tags favoritas
- `BlockedTags`: Tags bloqueadas
- `LikedGenres`: Gêneros favoritos
- `PtbrOnly`: Se quer apenas jogos em PT-BR
- `ControllerPreferred`: Se prefere jogos com suporte a controle
- `MinMainH`/`MaxMainH`: Faixa de duração preferida
- `MetacriticMin`/`OpenCriticMin`/`SteamPositiveMin`: Pisos de qualidade

### 👍 Feedback

**Feedback do usuário** sobre recomendações.

- `Id`: Primary Key
- `SteamId64`: ID Steam do usuário
- `AppId`: FK para Game
- `Action`: "Like", "Dislike", ou "Snooze"
- `CreatedAt`: Quando o feedback foi dado

## Estratégias de Armazenamento

### Arrays como Strings

Tags, gêneros e idiomas são armazenados como strings separadas por vírgulas:

```
Tags: "Action,Adventure,RPG"
Genres: "Action,Role-Playing"
Languages: "English,Portuguese,Spanish"
```

### Value Converters (EF Core)

```csharp
modelBuilder.Entity<Game>()
    .Property(g => g.Tags)
    .HasConversion(
        v => string.Join(',', v),
        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
    );
```

### Relacionamentos

- **1:1**: Game ↔ Scores, Game ↔ Hltb
- **1:N**: Game → Ownership, Game → Feedback
- **1:N**: UserPrefs → Ownership, UserPrefs → Feedback



