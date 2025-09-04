# Fluxo de Recomendações - NextPlay

## Sequência Completa

Este diagrama mostra o fluxo completo desde a seleção de filtros até a exibição de recomendações.

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant B as Backend API
    participant R as RAWG API
    participant D as Database
    
    U->>F: Seleciona filtros (vibe, duração)
    F->>F: Valida filtros obrigatórios
    F->>F: Monta payload JSON
    
    F->>B: POST /api/recommendations
    Note over B: Recebe RecommendRequest
    
    B->>D: Busca jogos existentes
    D-->>B: Lista de jogos
    
    loop Para cada jogo sem Metacritic
        B->>R: GET /api/games?search={name}
        R-->>B: Dados do jogo + Metacritic
        B->>D: Atualiza scores do jogo
    end
    
    B->>B: Aplica algoritmo de scoring
    Note over B: Calcula score baseado em:<br/>- Qualidade (Metacritic, Steam)<br/>- Preferências (tags, gêneros)<br/>- Duração (HLTB fit)<br/>- Vibe matching
    
    B->>B: Gera explicações "why"
    B-->>F: RecommendationsResponse
    
    F->>F: Transforma dados backend → frontend
    F->>U: Exibe cards de recomendações
    
    U->>F: Clica Like/Dislike/Snooze
    F->>B: POST /api/feedback
    B->>D: Salva feedback
    B-->>F: Confirmação
    F->>F: Atualiza UI (remove card)
```

## Etapas Detalhadas

### 1. Seleção de Filtros

- Usuário seleciona **vibe** (obrigatório): relax, história, raiva, etc.
- Usuário seleciona **duração** (obrigatório): rápido, médio, longo, muito longo
- Filtros opcionais: energia, social, conteúdo, controle, idioma, estrutura, sabores

### 2. Validação Frontend

- Hook `useLandingState` valida se campos obrigatórios estão preenchidos
- Botão "Ver recomendações" só fica habilitado com vibe + duração
- Monta payload JSON conforme schema da API

### 3. Processamento Backend

- Endpoint `/api/recommendations` recebe `RecommendRequest`
- Busca jogos existentes no banco SQLite
- **Enriquecimento em tempo real**: Para jogos sem Metacritic, chama RAWG API
- Atualiza banco com novos dados obtidos

### 4. Algoritmo de Scoring

```
score_total = 
  Wq * quality +           // Metacritic, OpenCritic, Steam
  Wp * preferences +       // Tags/gêneros favoritos
  Wa * duration_fit +      // Adequação HLTB à duração desejada
  Wr * recency +          // Jogos mais recentes
  Wc * compatibility +    // PT-BR, controller
  Wm * mood_match         // Vibe específica
```

### 5. Geração de Explicações

- Função `GenerateWhyReasons()` cria lista de motivos
- Exemplos: "High critic scores", "Perfect duration", "Matches your preferred genres"

### 6. Resposta e Exibição

- Backend retorna `RecommendationsResponse` com lista ordenada
- Frontend transforma dados para formato interno
- Exibe cards com capas, notas, duração HLTB, razões

### 7. Feedback do Usuário

- Botões Like/Dislike/Snooze em cada card
- Chama `/api/feedback` para salvar preferência
- Remove card da lista (otimistic update)



