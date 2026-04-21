const { execSync } = require('child_process');
const fs = require('fs');

try {
  const result = execSync('npm run build', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0/app', encoding: 'utf-8' });
  fs.writeFileSync('build_error.txt', "SUCCESS:\n" + result);
} catch (error) {
  fs.writeFileSync('build_error.txt', "ERROR:\n" + (error.stdout || error.message) + "\n\nSTDERR:\n" + (error.stderr || ''));
}
