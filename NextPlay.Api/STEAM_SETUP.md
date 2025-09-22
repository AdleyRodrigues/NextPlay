# Configuração da Steam API

## Como obter sua Steam API Key

1. **Acesse o site da Steam Web API**:
   - Vá para: <https://steamcommunity.com/dev/apikey>

2. **Faça login com sua conta Steam**

3. **Preencha o formulário**:
   - **Domain Name**: `localhost` (para desenvolvimento)
   - **Agree to terms**: Marque a caixa de concordância

4. **Copie sua API Key**:
   - A chave será exibida após o cadastro
   - Exemplo: `07F9BFEF2622AAA38581832BCB99C842`
   - ✅ **CONFIGURADO**: A API Key já foi configurada no sistema

## Formatos de Steam ID Aceitos

O sistema aceita **qualquer formato** de Steam ID e converte automaticamente:

### ✅ **Steam ID** (formato clássico)

```
STEAM_0:1:225722976
```

### ✅ **Steam ID64** (formato numérico)

```
76561198411711681
```

### ✅ **Steam ID3** (formato moderno)

```
[U:1:451445953]
```

### 🔄 **Conversão Automática**

- O sistema detecta automaticamente o formato
- Converte internamente para Steam ID64
- Funciona com qualquer um dos formatos acima

## Configuração no Projeto

1. **Abra o arquivo de configuração**:

   ```
   NextPlay.Api/appsettings.Development.json
   ```

2. **Substitua a chave**:

   ```json
   {
     "Steam": {
       "ApiKey": "SUA_CHAVE_AQUI"
     }
   }
   ```

3. **Para produção**, configure no `appsettings.json` ou variáveis de ambiente:

   ```json
   {
     "Steam": {
       "ApiKey": "SUA_CHAVE_DE_PRODUCAO"
     }
   }
   ```

## Funcionalidades Implementadas

### ✅ **SteamApiService**

- **Biblioteca do usuário**: Busca jogos, horas jogadas, último acesso
- **Conquistas**: Conquistas desbloqueadas por jogo
- **Estatísticas**: Estatísticas detalhadas do jogo

### ✅ **UserService**

- **RefreshUserLibraryAsync()**: Sincroniza biblioteca Steam com banco de dados
- Salva jogos e dados de propriedade (ownership)
- Atualiza informações existentes

### ✅ **RecommendationService**

- **GetRecommendationsAsync()**: Gera recomendações baseadas na biblioteca Steam
- Filtra jogos por vibes/mood
- Calcula scores baseados em qualidade, tempo de jogo, recência e match com vibes

### ✅ **Frontend Integration**

- **Conectar Steam ID**: Interface para inserir Steam ID64
- **Sincronização automática**: Busca biblioteca ao conectar
- **Recomendações personalizadas**: Baseadas na biblioteca do usuário

## Fluxo Completo

1. **Usuário insere Steam ID64** no frontend
2. **Frontend chama** `/api/refresh/{steamId64}`
3. **Backend busca** biblioteca na Steam API
4. **Backend salva** jogos e dados no banco
5. **Usuário seleciona** vibes/mood
6. **Frontend chama** `/api/recommendations`
7. **Backend filtra** jogos da biblioteca por vibes
8. **Backend retorna** recomendações personalizadas

## Endpoints Disponíveis

- `GET /api/refresh/{steamId64}` - Sincronizar biblioteca Steam
- `POST /api/recommendations` - Obter recomendações baseadas na biblioteca
- `POST /api/ranking/top-games` - Ranking de jogos da biblioteca

## Dados Coletados da Steam

- ✅ Lista de jogos possuídos
- ✅ Horas jogadas (total, Windows, Mac, Linux)
- ✅ Último acesso (timestamp)
- ✅ Imagens (ícone, logo, header)
- ✅ Conquistas desbloqueadas
- ✅ Estatísticas do jogo

## Próximos Passos

1. **Configurar Steam API Key** no `appsettings.Development.json`
2. **Testar integração** com Steam ID real
3. **Implementar cache** para otimizar performance
4. **Adicionar jobs** de sincronização periódica
