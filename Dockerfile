# Usar uma imagem base oficial do Node.js
FROM node:22-alpine

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiar o arquivo package.json e package-lock.json para o contêiner
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante do código do projeto para o contêiner
COPY . .

# Expor a porta que o Vite utiliza (por padrão é a 5173)
EXPOSE 80

# Comando para rodar o servidor de desenvolvimento do Vite
CMD ["npm", "run", "dev"]