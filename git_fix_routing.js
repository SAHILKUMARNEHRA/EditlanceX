const { execSync } = require('child_process');
const fs = require('fs');

try {
  execSync('git add .', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  const result = execSync('git commit -m "Fix router redirect for unauthenticated users, fix vercel routing via base url, fix hiring popup layout, add tab logo, and optimize UI interactions" && git push origin main', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  fs.writeFileSync('git_fix_routing.txt', result);
} catch (error) {
  fs.writeFileSync('git_fix_routing.txt', error.stdout || error.message);
}
