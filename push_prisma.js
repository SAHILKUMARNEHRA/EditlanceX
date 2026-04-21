const { execSync } = require('child_process');
const fs = require('fs');
try {
  const result = execSync('npx prisma db push', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0/backend', encoding: 'utf-8' });
  fs.writeFileSync('prisma-output.txt', result);
} catch (error) {
  fs.writeFileSync('prisma-output.txt', error.stdout || error.message);
}
