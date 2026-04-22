const { execSync } = require('child_process');
const fs = require('fs');

try {
  const result = execSync('git log -p', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8', maxBuffer: 1024 * 1024 * 50 });
  const lines = result.split('\n');
  const matches = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('onrender.com') || lines[i].includes('render.com')) {
      matches.push(lines[i]);
    }
  }
  fs.writeFileSync('render_url.txt', matches.join('\n'));
} catch (error) {
  fs.writeFileSync('render_url.txt', error.message);
}
