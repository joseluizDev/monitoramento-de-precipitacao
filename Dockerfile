# Etapa 1: Construção do projeto
FROM node:18 AS build

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos de dependências
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci

# Copiar todo o código fonte para dentro do container
COPY . .

# Construir o projeto
RUN npm run build

# Etapa 2: Produção
FROM nginx:alpine

# Copiar os arquivos construídos da etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Adicionar a configuração personalizada do Nginx
RUN echo 'server { \
   listen 80; \
   server_name localhost; \
   root /usr/share/nginx/html; \
   index index.html; \
   \
   location / { \
   try_files $uri /index.html; \
   } \
   \
   location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|webmanifest|map|json)$ { \
   expires 6M; \
   access_log off; \
   add_header Cache-Control "public"; \
   } \
   \
   error_page 404 /index.html; \
   }' > /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 80

# Iniciar o servidor Nginx
CMD ["nginx", "-g", "daemon off;"]