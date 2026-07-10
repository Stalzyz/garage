const fs = require('fs');
let content = fs.readFileSync('apps/web/app/page.tsx', 'utf-8');

// 1. Add useRouter import
if (!content.includes('import { useRouter } from "next/navigation"')) {
  content = content.replace('import Link from "next/link"', 'import Link from "next/link"\nimport { useRouter } from "next/navigation"');
}

// 2. Add router to component
if (!content.includes('const router = useRouter()')) {
  content = content.replace('export default function SplitReality() {\n  const [side, setSide] = useState', 'export default function SplitReality() {\n  const router = useRouter()\n  const [side, setSide] = useState');
}

// 3. Update navigate function
content = content.replace(
  'window.location.href = href',
  'router.push(href)'
);

// 4. In the portal orb's onDragEnd:
// Replace setSide('agency'); setNavVisible(true); with navigate('agency', '/agency');
content = content.replace(
  /setSide\('agency'\);\s*setNavVisible\(true\);/g,
  "navigate('agency', '/agency');"
);
content = content.replace(
  /setSide\('academy'\);\s*setNavVisible\(true\);/g,
  "navigate('academy', '/academy');"
);

// 5. Remove the middle pages.
// Search for `<AnimatePresence>\n            {side === 'agency'`
// and `<AnimatePresence>\n            {side === 'academy'`
// and remove both entire blocks!

function removeBlock(startStr) {
  let startIndex = content.indexOf(startStr);
  if (startIndex === -1) return;
  // find the closing </AnimatePresence> for this block
  let blockEndStr = '</AnimatePresence>';
  let endIndex = content.indexOf(blockEndStr, startIndex);
  if (endIndex !== -1) {
    content = content.slice(0, startIndex) + content.slice(endIndex + blockEndStr.length);
  }
}

removeBlock("<AnimatePresence>\n            {side === 'agency'");
removeBlock("<AnimatePresence>\n            {side === 'academy'");

fs.writeFileSync('apps/web/app/page.tsx', content);
