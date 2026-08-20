#!/bin/sh
set -e

echo "======================================="
echo "🚀 Iniciando configuração do Nginx"
echo "======================================="

# Define BACKEND_URL padrão (Railway) se não estiver definida
export BACKEND_URL=${BACKEND_URL:-https://eloquent-victory.railway.internal:8080/api/}
echo "✅ BACKEND_URL definida como: $BACKEND_URL"

# Gera configuração substituindo variáveis (adicione o BACKEND_URL aqui)
echo "🔧 Gerando configuração do Nginx..."
envsubst '${PORT} ${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "✅ Configuração gerada com sucesso!"
echo "---------------------------------------"

# Testa a configuração
echo "🔧 Testando configuração do Nginx..."
nginx -t

echo "======================================="
echo "🚀 Iniciando Nginx na porta $PORT..."
echo "======================================="

# Inicia o Nginx
exec nginx -g 'daemon off;'
