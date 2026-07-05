const fs = require('fs');
const path = require('path');

const dir = '/Users/stalinkumar/Documents/visuals_pro_web/grekam-os/apps/web/components/landing';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx') && file !== 'BackgroundWrapper.tsx' && file !== 'Header.tsx') {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the first <section className="..."> or <div className="...">
    // and append snap-start snap-always shrink-0 min-h-[100dvh]
    // Wait, it's safer to just look for className=" and insert it there.
    // Let's find the first occurrence of className="
    
    const classNameRegex = /className="([^"]*)"/;
    const match = content.match(classNameRegex);
    
    if (match) {
      const originalClasses = match[1];
      // Avoid duplicate insertion
      if (!originalClasses.includes('snap-start')) {
        let newClasses = originalClasses;
        
        // Remove min-h-screen if it exists so we can use min-h-[100dvh]
        newClasses = newClasses.replace(/min-h-screen/g, '');
        
        // Ensure flex and flex-col are there if needed? No, let's just add the snap classes
        newClasses = `${newClasses} snap-start snap-always shrink-0 min-h-[100dvh] overflow-hidden`.trim();
        
        content = content.replace(match[0], `className="${newClasses}"`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
});
