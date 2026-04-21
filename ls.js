const fs = require('fs');
try {
  const files = fs.readdirSync('/Users/sahilkumar/Desktop/EDITLANCEX2.0');
  fs.writeFileSync('ls_output.txt', files.join('\n'));
} catch (error) {
  fs.writeFileSync('ls_output.txt', error.message);
}
