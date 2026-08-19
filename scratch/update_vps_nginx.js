const fs = require('fs');
const path = '/etc/nginx/sites-available/grekam.in';
if (!fs.existsSync(path)) {
  console.error('Nginx config not found at:', path);
  process.exit(1);
}
let content = fs.readFileSync(path, 'utf8');

const target = '    location /api/v1 {';
const insertion = `    location /api/billing/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

`;

if (content.includes('location /api/billing/')) {
  console.log('Billing location block already exists in Nginx config.');
} else {
  content = content.replace(target, insertion + target);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully inserted billing location block into Nginx config.');
}
