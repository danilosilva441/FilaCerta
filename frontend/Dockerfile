# Estágio 1: Build do Angular
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Estágio 2: Nginx
FROM nginx:alpine

# Copia configuração
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia build do Angular
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/your-app-name/browser /usr/share/nginx/html

# Script de inicialização
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
