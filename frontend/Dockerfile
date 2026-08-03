# Estágio 1: Build do Angular
FROM node:20-alpine AS build
WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copia o resto do código e faz o build de produção
COPY . .
RUN npm run build

# Estágio 2: Configuração do Nginx
FROM nginx:alpine

# Remove a configuração padrão do Nginx e copia a nossa
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Limpa a pasta html padrão e copia os arquivos gerados pelo Angular
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/browser /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
