const { exec, spawn } = require('child_process');
const fs = require('fs');

const fzf = spawn('vim selected', {
  stdio: 'inherit',
  shell: true,
});

/*
child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
  console.log(child.stdout);
});

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});
*/

fzf.on('exit', (e, code) => {
  exec('cat selected', (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
    }
    console.log('Selected');
    console.log(`${stdout}`);
  });
});
