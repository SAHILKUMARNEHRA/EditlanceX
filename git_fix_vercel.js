const { execSync } = require('child_process');
const fs = require('fs');
try {
  const result = execSync('git add . && git commit -m "Fix typescript error in Signup.tsx preventing Vercel build" && git push origin main', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  fs.writeFileSync('git_fix_vercel.txt', result);
} catch (error) {
  fs.writeFileSync('git_fix_vercel.txt', error.stdout || error.message);
}
