#!/bin/sh
set -e
APACHE_PORT="${PORT:-80}"
echo "Listen ${APACHE_PORT}" > /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${APACHE_PORT}>/" /etc/apache2/sites-enabled/000-default.conf
exec apache2-foreground "$@"
