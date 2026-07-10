#!/bin/bash
sed -i 's/proxy_pass http:\/\/localhost:4005/proxy_pass http:\/\/localhost:4000/' /etc/nginx/sites-available/garage.grekam.in
sed -i 's/proxy_pass http:\/\/localhost:3005/proxy_pass http:\/\/localhost:3000/' /etc/nginx/sites-available/garage.grekam.in
nginx -t && systemctl reload nginx
