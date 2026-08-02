# Estágio de build - Usando Node.js 20 LTS
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copiar código fonte e buildar
COPY . .
RUN npm run build --prod

# Estágio de produção
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=build /app/dist/filacerta /usr/share/nginx/html

# Copiar configuração customizada do nginx (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
