const fs = require('fs');
const path = require('path');

const dir = '/Users/stalinkumar/Documents/visuals_pro_web/grekam-os/apps/web/components/landing';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('border border-white/5')) {
      content = content.replace(/border border-white\/5/g, '');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Removed border from ${file}`);
    }
  }
});
