FROM node:22 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
# Remover a linha duplicada de instalação do npm
# RUN npm install  
COPY . .
# Verificar se o script de build está presente no package.json
RUN ls -la && cat package.json && npm run build  
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]