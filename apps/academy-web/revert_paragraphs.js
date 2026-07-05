const fs = require('fs');
const path = require('path');

const dir = '/Users/stalinkumar/Documents/visuals_pro_web/grekam-os/apps/academy-web/components/landing';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('text-justify md:text-left') || content.includes('text-justify md:text-center')) {
      content = content.replace(/ text-justify md:text-left/g, '');
      content = content.replace(/ text-justify md:text-center/g, '');
      
      // Let's also remove any stray 'text-justify' that might be lingering at the end
      content = content.replace(/ text-justify/g, '');
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Reverted ${file}`);
    }
  }
});
