#!/bin/sh
# Substitui PORT_PLACEHOLDER pela variável PORT do Railway
sed -i "s|PORT_PLACEHOLDER|${PORT:-8080}|g" /etc/nginx/conf.d/default.conf
# Inicia o Nginx
nginx -g "daemon off;"
