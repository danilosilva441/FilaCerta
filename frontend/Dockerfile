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

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia o template de configuração
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Limpa a pasta html padrão e copia os arquivos gerados pelo Angular
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/your-app-name/browser /usr/share/nginx/html

# Expõe a porta 8080 (ou qualquer porta que o Railway usar)
EXPOSE ${PORT:-8080}

# Usa envsubst para substituir variáveis de ambiente no template
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
