const fs = require('fs');
const path = require('path');

const dir = '/Users/stalinkumar/Documents/visuals_pro_web/grekam-os/apps/academy-web/components/landing';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Find all <p className="..."> and append "text-justify md:text-left" (if not text-center)
    // or "text-justify md:text-center" (if text-center).
    content = content.replace(/<p className="([^"]+)"/g, (match, classes) => {
      // Don't add if already there
      if (classes.includes('text-justify')) return match;

      // Only target paragraphs that are likely body text (leading-relaxed, text-gray-..., text-[#...)
      if (classes.includes('leading-relaxed') || classes.includes('text-sm') || classes.includes('text-lg') || classes.includes('text-[#')) {
        hasChanges = true;
        if (classes.includes('text-center')) {
          // If it was centered, make it justified on mobile, centered on md
          return `<p className="${classes.replace('text-center', 'text-justify md:text-center')}"`;
        } else {
          // Make it justified on mobile, left on md
          return `<p className="${classes} text-justify md:text-left"`;
        }
      }
      return match;
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
