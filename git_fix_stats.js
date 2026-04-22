const { execSync } = require('child_process');
const fs = require('fs');

try {
  execSync('git add .', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  const result = execSync('git commit -m "Add realtime request badge to navbar, add recharts hiring stats to client dashboard, and fix AI image generation delay" && git push origin main', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  fs.writeFileSync('git_fix_stats.txt', result);
} catch (error) {
  fs.writeFileSync('git_fix_stats.txt', error.stdout || error.message);
}
