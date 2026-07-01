const fs = require('fs');
const path = require('path');

const apps = [
  { name: 'apps/web', dir: 'apps/web/app' },
  { name: 'apps/academy-web', dir: 'apps/academy-web/app' }
];

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        getFiles(path.join(dir, file), fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

function checkRouteExists(appDir, route) {
  // Very naive check: 
  // Strip query params and hashes
  let cleanRoute = route.split('?')[0].split('#')[0];
  if (cleanRoute === '/') return true; // root exists
  
  // A route like /dashboard/crm could map to:
  // appDir/dashboard/crm/page.tsx
  // appDir/(something)/dashboard/crm/page.tsx
  // appDir/dashboard/[id]/page.tsx
  
  // To keep it simple, let's just do a naive check for exact folder matching or dynamic segments.
  // Actually, a perfect check is hard. Let's just collect all routes that exist.
  return null; // Handled below
}

function getAllAppRoutes(appDir) {
  const routes = [];
  function traverse(dir, currentRoute) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        // Skip route groups like (crm) or just ignore the parenthesis in the route
        if (file.startsWith('(') && file.endsWith(')')) {
          traverse(fullPath, currentRoute);
        } else {
          traverse(fullPath, currentRoute + '/' + file);
        }
      } else if (file === 'page.tsx') {
        routes.push(currentRoute || '/');
      }
    }
  }
  traverse(appDir, '');
  return routes;
}

// Convert dynamic routes like /dashboard/projects/[id] to a regex
function routeToRegex(route) {
  let r = route.replace(/\[\.\.\.[^\]]+\]/g, '.*'); // catch all
  r = r.replace(/\[[^\]]+\]/g, '[^/]+'); // dynamic param
  return new RegExp('^' + r + '$');
}

apps.forEach(app => {
  console.log(`\n=== Auditing ${app.name} ===`);
  const appRoutes = getAllAppRoutes(app.dir);
  const routeRegexes = appRoutes.map(routeToRegex);
  
  const allSourceDirs = [app.dir, path.join(app.name, 'src')];
  let allFiles = [];
  allSourceDirs.forEach(d => getFiles(d, allFiles));
  
  const linkRegex = /(?:href|router\.push)\s*=?\s*[\{\(]?\s*[`'"](\/[^`'"]+)[`'"]/g;
  
  let brokenCount = 0;
  let brokenList = [];

  allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const link = match[1].split('?')[0].split('#')[0]; // clean link
      if (link === '/') continue; // root
      
      let found = false;
      for (const rx of routeRegexes) {
        if (rx.test(link)) {
          found = true;
          break;
        }
      }
      
      if (!found) {
        brokenCount++;
        brokenList.push({ file: file, link: link });
      }
    }
  });

  if (brokenCount === 0) {
    console.log("No broken static links found!");
  } else {
    console.log(`Found ${brokenCount} potentially broken static links:`);
    // Unique by file and link
    const unique = [...new Set(brokenList.map(item => `${item.link} (in ${item.file})`))];
    unique.sort().forEach(item => console.log(item));
  }
});
