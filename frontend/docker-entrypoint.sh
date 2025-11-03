#!/bin/sh
# Заменяем PORT в конфиге nginx на значение из переменной окружения
PORT=${PORT:-80}
sed -i "s/listen 80;/listen $PORT;/" /etc/nginx/conf.d/default.conf

# Запускаем nginx
exec nginx -g "daemon off;"

