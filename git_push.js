const { execSync } = require('child_process');
const fs = require('fs');
try {
  const result = execSync('git add . && git commit -m "Deploy latest dark cinematic theme, bug fixes, and AI notifications" && git push origin main', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  fs.writeFileSync('git-output.txt', result);
} catch (error) {
  fs.writeFileSync('git-output.txt', error.stdout || error.message);
}
