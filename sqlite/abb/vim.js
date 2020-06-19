const { exec, spawn } = require('child_process');

const vim = spawn('vim .tmp/data', {
  stdio: 'inherit',
  shell: true,
});

vim.on('exit', (e, code) => {
  exec('cat .tmp/data', (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
    }
    console.log('data:');
    console.log(`${stdout}`);
  });
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
