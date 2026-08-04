#!/bin/sh
set -e

echo "======================================="
echo "🚀 Iniciando configuração do Nginx"
echo "======================================="

# Define porta padrão se não estiver definida
export PORT=${PORT:-8080}
echo "✅ PORT definida como: $PORT"

# Gera configuração substituindo variáveis
echo "🔧 Gerando configuração do Nginx..."
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

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
