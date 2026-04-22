const { execSync } = require('child_process');
const fs = require('fs');

try {
  execSync('git add .', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  const result = execSync('git commit -m "Update favicon to a colorful SVG, and make pending response icon static" && git push origin main', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  fs.writeFileSync('git_fix_favicon.txt', result);
} catch (error) {
  fs.writeFileSync('git_fix_favicon.txt', error.stdout || error.message);
}
