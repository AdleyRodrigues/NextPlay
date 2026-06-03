# Fluxo de Interação do Usuário (Gameterapia)

Este fluxograma em formato Mermaid representa a jornada do usuário (UX) dentro da interface frontend do Gameterapia.

## Jornada do Jogador

A ideia central do Gameterapia é remover a fricção. O usuário não precisa criar conta, não precisa fazer login com a Steam e não precisa compartilhar dados sensíveis. O acesso é imediato e focado no "aqui e agora" do jogador.

```mermaid
graph TD
    A[Acessa Gameterapia (Página Inicial)] --> B{Visualiza Formulário de Perfil}
    
    B --> C[Passo 1: Seleciona Plataforma]
    C --> |PC, PS5, Xbox, Switch| D[Passo 2: Seleciona Habilidade Desejada]
    
    D --> |Lógica, Reflexos, Paciência, etc.| E[Passo 3: Tempo Diário Opcional]
    
    E --> |Curto, Médio, Longo| F[Clica em 'Gerar Recomendações']
    
    F --> G{Validação de Frontend}
    G -- "Faltam Dados" --> H[Exibe Tooltip / Snackbar Error (no rodapé)]
    G -- "Tudo Certo" --> I[Loading State Ativado]
    
    I --> J(Faz Requisição POST para o Backend)
    
    J -- "Sucesso" --> K[Renderiza Grid de Recomendações]
    J -- "Erro/Timeout" --> H
    
    K --> L[Usuário vê Jogos, Capas, Notas e 'Por que jogar?']
```

### Explicação do Fluxo:

1. **Acesso**: A página carrega exibindo o design minimalista de gradientes e o componente `LandingFilter.tsx`.
2. **Seleção Interativa**: As opções de escolha (Chips) possuem `Tooltips` que explicam o que cada seleção trará de benefício cognitivo.
3. **Validação e Loading**: O botão só funciona caso a Plataforma e a Habilidade estejam preenchidos. Quando o usuário clica, o estado da aplicação entra em Loading (prevenindo cliques duplos).
4. **Exibição dos Resultados**: O componente `<RecommendationsList />` aparece com um *Fade In*, renderizando os `<GameCard />` detalhando os motivos de cada jogo ser um ajuste perfeito para os objetivos do usuário.
