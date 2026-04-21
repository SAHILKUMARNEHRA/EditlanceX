const { execSync } = require('child_process');
const fs = require('fs');
try {
  const result = execSync('git add . && git commit -m "Complete overhaul: add AI images, fix deadline logic, add admin view, fix invisible buttons, update auth logic, and convert budget to K notation" && git push origin HEAD:main', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  fs.writeFileSync('git-output.txt', result);
} catch (error) {
  fs.writeFileSync('git-output.txt', error.stdout || error.message);
}
