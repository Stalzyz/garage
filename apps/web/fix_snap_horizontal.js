const fs = require('fs');
const path = require('path');

const dir = '/Users/stalinkumar/Documents/visuals_pro_web/grekam-os/apps/web/components/landing';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx') && file !== 'BackgroundWrapper.tsx' && file !== 'Header.tsx') {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // The current class string to find
    const targetString = 'snap-start snap-always shrink-0 min-h-[100dvh] h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col justify-center';
    
    // What to replace it with:
    // Add w-[100dvw] min-w-[100dvw]
    const replacementString = 'snap-start snap-always shrink-0 w-[100dvw] min-w-[100dvw] min-h-[100dvh] h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col justify-center';
    
    if (content.includes(targetString)) {
      content = content.replace(targetString, replacementString);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    } else {
      console.log(`Did not find exact target string in ${file}`);
    }
  }
});
