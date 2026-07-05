const fs = require('fs');
const path = require('path');

const dir = '/Users/stalinkumar/Documents/visuals_pro_web/grekam-os/apps/web/components/landing';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx') && file !== 'BackgroundWrapper.tsx' && file !== 'Header.tsx') {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replacing min-h-[100dvh] overflow-hidden with min-h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar
    content = content.replace(/snap-start snap-always shrink-0 min-h-\[100dvh\] overflow-hidden/g, 'snap-start snap-always shrink-0 min-h-[100dvh] h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col justify-center');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
