const sh = require('shelljs');

sh.exec('echo "paok\naris\nosfp" | fzf', (code, stdout, stderr) => {
  console.log('Exit code:', code);
  console.log('Program output:', stdout);
  console.log('Program stderr:', stderr
});
