FROM node:22 AS build
WORKDIR /app

# Copiar apenas arquivos essenciais para instalar dependências
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copiar o restante do código
COPY . .

# Executar o build
RUN npm run build

# Preparar a imagem final com nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Expor a porta 80
EXPOSE 80

# Iniciar o servidor
CMD ["nginx", "-g", "daemon off;"]
