const fs = require('fs');
const path = require('path');

const dir = '/Users/stalinkumar/Documents/visuals_pro_web/grekam-os/apps/web/components/landing';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx') && file !== 'BackgroundWrapper.tsx' && file !== 'Header.tsx') {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We want to replace the previously injected string with nothing, 
    // and instead add the new glowing card styling.
    
    const targetString = ' snap-start snap-always shrink-0 w-[100dvw] min-w-[100dvw] min-h-[100dvh] h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col justify-center';
    
    // First remove the old string if it exists
    if (content.includes(targetString)) {
      content = content.replace(targetString, '');
    }

    // Now, find the first occurrence of className=" and inject the glowing card styling
    // But we only want to do this to the topmost container (usually <section> or <div className="py-...">)
    // Wait, some components already have py-32 or py-24. We want them to look like cards.
    // The new classes: max-w-5xl mx-auto bg-[#0A0A0A] rounded-[3rem] shadow-[0_0_60px_rgba(73,171,201,0.05)] border border-white/5 my-12 p-8 md:p-12
    
    const classNameRegex = /className="([^"]*)"/;
    const match = content.match(classNameRegex);
    
    if (match) {
      const originalClasses = match[1];
      
      // Avoid duplicate insertion
      if (!originalClasses.includes('bg-[#0A0A0A] rounded-[3rem]')) {
        let newClasses = originalClasses;
        
        // Remove full-width or background classes that conflict
        newClasses = newClasses.replace(/bg-\[[^\]]+\]/g, '');
        newClasses = newClasses.replace(/container mx-auto/g, ''); // We handle centering at the card level
        
        // Add card styling
        newClasses = `${newClasses} max-w-6xl mx-auto bg-[#0A0A0A]/80 backdrop-blur-md rounded-[3rem] shadow-[0_0_80px_rgba(73,171,201,0.07)] border border-white/5 my-8 p-6 md:p-12`.trim();
        
        content = content.replace(match[0], `className="${newClasses}"`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
      } else {
        console.log(`Already card styled: ${file}`);
      }
    }
  }
});
