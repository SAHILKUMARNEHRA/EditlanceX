const { execSync } = require('child_process');
const fs = require('fs');
try {
  const o1 = execSync('git add -A', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  const o2 = execSync('git commit -m "Fix black screen on new client signup by replacing recharts PieChart with lucide PieChartIcon for empty state, and handle missing names"', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  const o3 = execSync('git push origin main', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  fs.writeFileSync('push_out.txt', o1 + o2 + o3);
} catch (e) {
  fs.writeFileSync('push_out.txt', e.stdout || e.message);
}
