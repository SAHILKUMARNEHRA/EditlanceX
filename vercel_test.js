const { execSync } = require('child_process');
const fs = require('fs');
try {
  const result = execSync('npx vercel --version', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  fs.writeFileSync('vercel_test.txt', result);
} catch (error) {
  fs.writeFileSync('vercel_test.txt', error.message || error.stdout);
}
