#!/bin/bash
expect -c '
spawn ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no root@72.61.231.187 "cd /root/grekam-os && git pull origin main && cd /root/grekam-os/apps/web && npm run build && pm2 restart grekam-os-web"
expect "password:"
send "Stalin123@#\r"
expect eof
'
