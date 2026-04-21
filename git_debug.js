const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Checking git status...");
  const status = execSync('git status', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  console.log(status);
  
  console.log("Checking git remote...");
  const remote = execSync('git remote -v', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  console.log(remote);
  
  console.log("Checking git log...");
  const log = execSync('git log -n 5 --oneline', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  console.log(log);
  
  console.log("Attempting git push...");
  const push = execSync('git push origin main', { cwd: '/Users/sahilkumar/Desktop/EDITLANCEX2.0', encoding: 'utf-8' });
  console.log(push);
  
  fs.writeFileSync('git_debug.txt', `STATUS:\n${status}\n\nREMOTE:\n${remote}\n\nLOG:\n${log}\n\nPUSH:\n${push}`);
} catch (error) {
  console.error("ERROR:");
  console.error(error.stdout || error.message);
  fs.writeFileSync('git_debug.txt', `ERROR:\n${error.stdout || error.message}\n${error.stderr || ''}`);
}
