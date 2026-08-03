# Estágio 1: Build do Angular
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build --prod

# Estágio 2: Nginx
FROM nginx:alpine
# Copia o seu arquivo nginx.conf personalizado para dentro do container
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copia os arquivos gerados pelo Angular para a pasta padrão do Nginx
COPY --from=build /app/dist/browser /usr/share/nginx/html