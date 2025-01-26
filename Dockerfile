# Etapa 1: Build
FROM node:18 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Instalar dependências completas para o build
RUN npm install

# Copiar código-fonte
COPY . .

# Inspecionar arquivos (opcional, para debugging)
RUN ls -la

# Construir o projeto
RUN npm run build

# Etapa 2: Produção
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN echo 'server { \
   listen 80; \
   server_name localhost; \
   root /usr/share/nginx/html; \
   index index.html; \
   location / { \
   try_files $uri /index.html; \
   } \
   location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|webmanifest|map|json)$ { \
   expires 6M; \
   access_log off; \
   add_header Cache-Control "public"; \
   } \
   error_page 404 /index.html; \
   }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
