const { execSync } = require('child_process');
const fs = require('fs');
try {
  const result = execSync('npx tsc --noEmit', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0/app', encoding: 'utf-8' });
  fs.writeFileSync('ts-output.txt', result);
} catch (error) {
  fs.writeFileSync('ts-output.txt', error.stdout || error.message);
}
