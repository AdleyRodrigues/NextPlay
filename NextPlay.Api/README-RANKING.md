# Algoritmo de Ranqueamento NextPlay

## Visão Geral

O algoritmo de ranqueamento do NextPlay seleciona o **Top 5 jogos** da biblioteca Steam do usuário, combinando múltiplos sinais para maximizar a satisfação baseada no modo selecionado.

## Modos Disponíveis

| Modo | Descrição | Foco Principal |
|------|-----------|----------------|
| **jogar** | Começar algo novo | Novelty (jogos com pouco tempo) |
| **terminar** | Continuar jogos em andamento | MidProgress (jogos no meio) |
| **zerar** | Finalizar campanhas | NearFinish (jogos quase terminados) |
| **platinar** | 100% conquistas | NearFinish + baixa recency |

## Fórmulas de Scoring

### Modo "jogar"

```
score = 0.55 × qualidade + 0.30 × novelty + 0.15 × recency
```

### Modo "terminar"

```
score = 0.55 × qualidade + 0.30 × midProgress + 0.15 × recency
```

### Modo "zerar"

```
score = 0.55 × qualidade + 0.30 × nearFinish + 0.15 × recency
```

### Modo "platinar"

```
score = 0.50 × qualidade + 0.40 × nearFinish + 0.10 × (1 - recency)
```

## Componentes do Algoritmo

### 1. Qualidade Externa (55-50% do peso)

#### Steam Wilson Score

- **Fórmula**: Wilson confidence interval com z=1.96
- **Peso dinâmico**: 0.20-0.50 baseado no volume de reviews
- **Baixa confiança**: < 25 reviews → peso 0.20
- **Alta confiança**: ≥ 500 reviews → peso 0.50

#### Metacritic

- **Normalização**: 60-90 → 0-1 (clamp)
- **Peso**: 0.35 (quando disponível)

#### OpenCritic

- **Normalização**: 60-90 → 0-1 (clamp)
- **Peso**: 0.25 (quando disponível)

### 2. Sinais de Uso

#### Novelty (quer começar algo novo)

- 0 min → 1.0
- ≤ 120 min → 0.8
- ≤ 600 min → 0.5
- > 600 min → 0.2

#### Recency (retomar o parado)

- ≤ 7 dias → 0.0
- ≤ 30 dias → 0.5
- > 90 dias ou nunca → 1.0

#### Progress (conquistas)

- Percentual de conquistas desbloqueadas / 100
- Fallback: 0.3 se não disponível

#### Kernels Gaussianos

- **NearFinish**: `gauss(progress, target=0.90, σ=0.10)`
- **MidProgress**: `gauss(progress, target=0.45, σ=0.15)`

## Robustez e Fallbacks

### Dados Faltantes

- **Sem Metacritic/OpenCritic**: Algoritmo funciona apenas com Steam Wilson
- **Sem reviews Steam**: quality_steam = 0.5, reduz peso do Steam
- **Sem progresso**: progress = 0.3, kernels se ajustam naturalmente
- **Sem lastPlayed**: recency = 1.0 (tratado como parado há muito tempo)

### Conflitos de Qualidade

- **Conflito severo**: Se distância entre fontes > 0.5, aplica trimmed mean
- **Renormalização**: Pesos são renormalizados quando fontes estão ausentes

## API Endpoints

### POST /api/ranking/top-games

**Request:**

```json
{
  "steamId64": "76561198000000000",
  "mode": "jogar",
  "limit": 5
}
```

**Response:**

```json
{
  "generatedAt": "2024-01-15T10:30:00Z",
  "steamId64": "76561198000000000",
  "mode": "jogar",
  "items": [
    {
      "appId": 730,
      "name": "Counter-Strike 2",
      "finalScore": 0.87,
      "quality": {
        "steamWilson": 0.92,
        "metacritic": 83,
        "combined": 0.89
      },
      "usage": {
        "novelty": 0.8,
        "recency": 0.0,
        "progress": 0.45,
        "playtimeMinutes": 90
      },
      "why": [
        "Bem avaliado: Metacritic 83% / Steam 92%",
        "Você jogou pouco (1.5h) - bom para retomar",
        "Combina com seu objetivo de começar algo novo hoje"
      ],
      "rank": 1
    }
  ],
  "totalGamesAnalyzed": 42
}
```

## Configuração

### Steam API Key

Adicione sua Steam API Key no `appsettings.Development.json`:

```json
{
  "Steam": {
    "ApiKey": "YOUR_STEAM_API_KEY_HERE"
  }
}
```

### Obter Steam API Key

1. Acesse: <https://steamcommunity.com/dev/apikey>
2. Faça login com sua conta Steam
3. Insira um nome para sua aplicação
4. Copie a API Key gerada

## Explicabilidade

Cada jogo no ranking inclui 2-4 razões explicativas:

### Exemplos de "Why"

- **Qualidade**: "Bem avaliado: Metacritic 87% / Steam 94%"
- **Uso**: "Você jogou pouco (2.5h) - bom para retomar"
- **Progresso**: "Quase terminado (85%) - fácil de finalizar"
- **Modo**: "Combina com seu objetivo de zerar campanhas hoje"

## Critérios de Qualidade

✅ **Top 5 prioriza jogos bem avaliados** quando há dados de qualidade externa  
✅ **Estável**: Pequenas variações não reordenam drasticamente  
✅ **Robusto a dados faltantes**: Funciona mesmo com informações limitadas  
✅ **Explicável**: Cada item com motivos claros  
✅ **Diversificado**: Evita 5 jogos do mesmo tipo (quando gêneros disponíveis)

## Testando o Algoritmo

### 1. Usando o Frontend

- Acesse a página de Ranking
- Selecione um modo (jogar, terminar, zerar, platinar)
- Clique em "Gerar Ranking"

### 2. Usando a API diretamente

```bash
curl -X POST "https://localhost:7000/api/ranking/top-games" \
  -H "Content-Type: application/json" \
  -d '{
    "steamId64": "76561198000000000",
    "mode": "jogar",
    "limit": 5
  }'
```

### 3. Dados Mock

Se a Steam API não estiver configurada, o algoritmo usa dados mock para demonstração:

- Counter-Strike 2 (1200min, 45% conquistas)
- Apex Legends (800min, 30% conquistas)
- Cyberpunk 2077 (60min, 15% conquistas)
- Plague Tale: Requiem (300min, 85% conquistas)
- Red Dead Redemption 2 (0min, 0% conquistas)
- Hogwarts Legacy (450min, 70% conquistas)
- It Takes Two (180min, 95% conquistas)
- Sea of Stars (90min, 25% conquistas)

## Logs e Debugging

O algoritmo gera logs detalhados:

- Bibliotecas Steam obtidas
- Dados de qualidade enriquecidos
- Scores calculados por modo
- Explicações geradas

Verifique os logs em `logs/nextplay-YYYYMMDD.txt` para debugging.
