# 🎮 NextPlay

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](http://makeapullrequest.com)

> **O futuro da descoberta de jogos está aqui.** NextPlay é um sistema inteligente de recomendação que transforma sua biblioteca Steam em uma experiência personalizada de descoberta, combinando análise de dados avançada com preferências pessoais para te ajudar a encontrar seu próximo jogo favorito.

---

## 🎯 Por que este projeto existe?

**O problema é real e afeta milhões de gamers:** Você já abriu sua biblioteca Steam com centenas de jogos e ficou perdido, sem saber o que jogar? Ou comprou jogos em promoção que nunca tocou? 

A indústria de games movimenta **bilhões de dólares** anualmente, mas ainda não resolveu um dos maiores desafios dos gamers: **a descoberta inteligente de conteúdo**. Plataformas como Steam, Epic Games Store e outras oferecem milhares de títulos, mas falta personalização real baseada no comportamento e preferências individuais.

**NextPlay resolve isso** criando um algoritmo que entende você como gamer e transforma sua biblioteca em uma experiência de descoberta personalizada e explicável.

---

## 🧠 Como funciona?

NextPlay utiliza **inteligência artificial e análise de dados** para criar recomendações precisas:

### 📊 **Análise da Biblioteca Steam**
- Conecta-se à sua conta Steam via SteamID64
- Analisa horas jogadas, conquistas desbloqueadas e padrões de acesso
- Identifica jogos abandonados, em progresso e nunca iniciados

### 🏆 **Avaliação de Qualidade Multicamada**
- **Steam Wilson Score**: Análise estatística avançada das reviews da comunidade
- **Metacritic & OpenCritic**: Integração com críticas profissionais
- **Sistema de confiança**: Pesos dinâmicos baseados no volume de avaliações

### 🎯 **Algoritmo de Ranqueamento Inteligente**
O sistema oferece **4 modos personalizados**:

| Modo | Objetivo | Algoritmo Focado |
|------|----------|------------------|
| 🆕 **Jogar** | Começar algo novo | Novelty + qualidade + recência |
| 🔄 **Terminar** | Continuar jogos em andamento | Progresso médio + qualidade |
| 🏁 **Zerar** | Finalizar campanhas | Quase terminado + qualidade |
| 💎 **Platinar** | 100% conquistas | Alta completude + qualidade |

### 📈 **Fórmula de Scoring Avançada**
```
Score Final = 55% Qualidade + 30% Contexto + 15% Recência
```

Cada recomendação inclui **explicações claras** do porquê foi sugerida, tornando o processo transparente e educativo.

---

## 🚀 Demonstração

> **Em breve:** Screenshots e GIFs demonstrando a interface e funcionalidades

### Funcionalidades Principais:
- ✅ **Login Steam** - Autenticação via SteamID64
- ✅ **Recomendações Personalizadas** - Top 5 jogos baseado no modo selecionado
- ✅ **Sistema de Feedback** - Like/Dislike para melhorar futuras recomendações
- ✅ **Histórico de Interações** - Acompanhe sua jornada de descoberta
- ✅ **Interface Moderna** - Design responsivo com tema escuro/claro
- ✅ **Explicabilidade** - Cada recomendação vem com motivos claros

---

## 🌟 Visão Futura: Integração com Plataformas de Games

### **Para a Nuuvem e outras plataformas:**

**NextPlay representa uma oportunidade única** de transformar a experiência de descoberta de jogos:

#### 🎯 **Aumento de Engajamento**
- **Reduz abandono de jogos** através de recomendações inteligentes
- **Aumenta tempo de sessão** com sugestões mais relevantes
- **Melhora satisfação do usuário** com descobertas personalizadas

#### 💰 **Oportunidades de Monetização**
- **Recomendações de jogos em promoção** baseadas no perfil do usuário
- **Sistema de wishlist inteligente** que sugere jogos antes mesmo do lançamento
- **Análise de comportamento** para estratégias de marketing direcionadas

#### 📊 **Insights Valiosos**
- **Dados de preferências** para curadoria de catálogo
- **Padrões de consumo** para negociações com publishers
- **Métricas de engajamento** para otimização da plataforma

#### 🔮 **Funcionalidades Futuras**
- **Integração com múltiplas plataformas** (Epic, GOG, Xbox Game Pass)
- **Recomendações sociais** baseadas em amigos e comunidades
- **IA generativa** para descrições personalizadas de jogos
- **Sistema de conquistas gamificado** para descoberta de jogos

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18** + **TypeScript** - Interface moderna e type-safe
- **Vite** - Build tool ultra-rápido
- **Material-UI (MUI)** - Componentes profissionais
- **React Query** - Gerenciamento de estado e cache inteligente
- **React Router** - Navegação fluida
- **Zod** - Validação de dados robusta

### **Backend**
- **.NET 8** - API moderna e performática
- **Entity Framework Core** - ORM robusto
- **SQLite** - Banco de dados leve e eficiente
- **Serilog** - Logging estruturado
- **Quartz.NET** - Jobs em background

### **Integrações Externas**
- **Steam Web API** - Biblioteca e conquistas do usuário
- **Steam Store API** - Reviews e metadados dos jogos
- **RAWG API** - Notas do Metacritic e informações adicionais
- **OpenCritic API** - Críticas profissionais
- **HowLongToBeat** - Duração estimada das campanhas

---

## 🚀 Instalação e Execução

### **Pré-requisitos**
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (recomendado) ou npm

### **1. Clone o repositório**
```bash
git clone https://github.com/AdleyRodrigues/NextPlay.git
cd NextPlay
```

### **2. Configure o Backend (.NET)**
```bash
cd NextPlay.Api

# Restaure as dependências
dotnet restore

# Configure a Steam API Key (opcional para desenvolvimento)
# Edite appsettings.Development.json e adicione sua chave:
# {
#   "Steam": {
#     "ApiKey": "SUA_STEAM_API_KEY_AQUI"
#   }
# }

# Execute o backend
dotnet run
```

### **3. Configure o Frontend (React)**
```bash
cd nextplay

# Instale as dependências
pnpm install

# Execute o frontend
pnpm dev
```

### **4. Acesse a aplicação**
- **Frontend**: http://localhost:5173
- **Backend API**: https://localhost:7000
- **Swagger UI**: https://localhost:7000/swagger

### **🔑 Obter Steam API Key (Opcional)**
1. Acesse: https://steamcommunity.com/dev/apikey
2. Faça login com sua conta Steam
3. Insira um nome para sua aplicação
4. Copie a API Key gerada

> **Nota**: A API Key é obrigatória para o funcionamento do sistema.

---

## 🤝 Contribuição

**NextPlay é um projeto open-source** e estamos sempre abertos a contribuições da comunidade!

### **Como contribuir:**
1. **Fork** o repositório
2. **Crie uma branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra um Pull Request**

### **Áreas de interesse:**
- 🧠 **Melhorias no algoritmo** de recomendação
- 🎨 **Interface e UX** mais intuitiva
- 🔌 **Novas integrações** com plataformas de games
- 📊 **Análise de dados** e métricas
- 🌐 **Internacionalização** (i18n)
- 🧪 **Testes automatizados**

### **Ideias e sugestões:**
Tem uma ideia incrível? Abra uma [Issue](https://github.com/AdleyRodrigues/NextPlay/issues) e vamos discutir!

---

## 👨‍💻 Autor

**Adley Rodrigues**
- 💼 **LinkedIn**: [linkedin.com/in/adley-rodrigues-9168581a4](https://www.linkedin.com/in/adley-rodrigues-9168581a4/)
- 📧 **Email**: adleyrc.job@gmail.com
- 🐙 **GitHub**: [@AdleyRodrigues](https://github.com/AdleyRodrigues)

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## ⭐ Se você gostou da ideia, deixe uma estrela no repositório!

**NextPlay** representa o futuro da descoberta de jogos - uma experiência personalizada, inteligente e explicável que transforma a forma como interagimos com nossa biblioteca de games.

*Juntos, podemos revolucionar como os gamers descobrem seus próximos jogos favoritos!* 🚀

---

<div align="center">

**Feito com ❤️ para a comunidade gamer**

[![GitHub stars](https://img.shields.io/github/stars/AdleyRodrigues/NextPlay?style=social)](https://github.com/AdleyRodrigues/NextPlay)
[![GitHub forks](https://img.shields.io/github/forks/AdleyRodrigues/NextPlay?style=social)](https://github.com/AdleyRodrigues/NextPlay)

</div>