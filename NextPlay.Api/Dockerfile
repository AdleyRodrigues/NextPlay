# Estágio de build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar csproj e restaurar dependências
COPY ["NextPlay.Api.csproj", "./"]
RUN dotnet restore "NextPlay.Api.csproj"

# Copiar o resto do código e compilar
COPY . .
RUN dotnet build "NextPlay.Api.csproj" -c Release -o /app/build

# Estágio de publicação
FROM build AS publish
RUN dotnet publish "NextPlay.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Estágio final (imagem de execução)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expor a porta 8080 padrão do Render e configurar ASP.NET Core
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "NextPlay.Api.dll"]
