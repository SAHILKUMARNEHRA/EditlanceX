const { execSync } = require('child_process');
const fs = require('fs');
try {
  const result = execSync('git log --oneline | grep "Completely overhaul landing page"', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  fs.writeFileSync('git_log_test.txt', result);
} catch (error) {
  fs.writeFileSync('git_log_test.txt', error.stdout || error.message);
}
