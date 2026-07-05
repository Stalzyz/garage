const fs = require('fs');
const path = require('path');

const dir = '/Users/stalinkumar/Documents/visuals_pro_web/grekam-os/apps/academy-web/components/landing';

const replacements = {
  '#25211E': '#050505',
  '#2A2522': '#0A0A0A',
  '#1F1A18': '#000000',
  '#3C3531': '#1F1F1F',
  '#342D2A': '#141414',
  '#48403C': '#2A2A2A',
  '#AFA195': '#A1A1AA',
  '#8e7e6e': '#71717A'
};

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let hasChanges = false;
    for (const [oldVal, newVal] of Object.entries(replacements)) {
      if (content.includes(oldVal)) {
        content = content.split(oldVal).join(newVal);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
