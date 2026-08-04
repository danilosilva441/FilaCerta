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

# Estágio 2: Nginx com configuração dinâmica
FROM nginx:alpine

# Instala gettext para envsubst
RUN apk add --no-cache gettext

# Remove configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia os arquivos do Angular
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/build-output /usr/share/nginx/html

# Copia o template e script
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:${PORT:-8080}/health || exit 1

EXPOSE 8080

CMD ["/start.sh"]
