const { execSync } = require('child_process');
try {
  execSync('git commit -am "Fix black screen on new client signup by replacing recharts PieChart with lucide PieChartIcon for empty state, and handle missing names"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
} catch (e) {
  console.error(e.message);
}
