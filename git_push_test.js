const { execSync } = require('child_process');
const fs = require('fs');
try {
  const result = execSync('git push origin main 2>&1', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  fs.writeFileSync('git_push_result.txt', result);
} catch (error) {
  fs.writeFileSync('git_push_result.txt', error.stdout || error.message);
}
