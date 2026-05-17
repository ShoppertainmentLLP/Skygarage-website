#!/bin/sh
sed -i "s/__PORT__/$PORT/g" /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"
