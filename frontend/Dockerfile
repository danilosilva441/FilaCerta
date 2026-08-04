# Estágio 1: Build do Angular
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Cria um diretório padronizado para o output
RUN if [ -d "/app/browser" ]; then \
        echo "Build encontrado em /app/browser" && \
        mkdir -p /app/build-output && \
        cp -r /app/browser/* /app/build-output/; \
    elif [ -d "/app/dist" ]; then \
        echo "Build encontrado em /app/dist" && \
        BUILD_DIR=$(find /app/dist -name "browser" -type d | head -n 1) && \
        if [ -n "$BUILD_DIR" ]; then \
            echo "Copiando de $BUILD_DIR" && \
            mkdir -p /app/build-output && \
            cp -r $BUILD_DIR/* /app/build-output/; \
        else \
            echo "Copiando da raiz do dist" && \
            mkdir -p /app/build-output && \
            cp -r /app/dist/* /app/build-output/; \
        fi; \
    else \
        echo "ERRO: Nenhum build encontrado!" && \
        echo "Conteúdo de /app:" && \
        ls -la /app/ && \
        exit 1; \
    fi

# Estágio 2: Configuração do Nginx
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/build-output /usr/share/nginx/html

CMD sh -c "sed -i 's/PORT_PLACEHOLDER/'\"$PORT\"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
