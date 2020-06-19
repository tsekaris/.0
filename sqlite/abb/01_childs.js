// https://github.com/junegunn/fzf/issues/662
// import { spawn } from 'child_process';
// den letourgei me es6

const child_process = require('child_process');

function sh(req) {
  return new Promise((resolve, reject) => {
    const child = child_process.spawn(req, {
      stdio: ['inherit', 'pipe', 'inherit'],
      shell: true,
    });
    child.stdout.setEncoding('utf-8');
    child.on('exit', (code) => {
      if (code !== 0) {
        child.stderr.on('data', (data) => {
          reject(data);
        });
      } else {
        child.stdout.on('data', (data) => {
          resolve(data);
        });
      }
    });
  });
}

function vim() {
  return new Promise((resolve, reject) => {
    const vim = child_process.spawn('vim .tmp/data', {
      stdio: 'inherit',
      shell: true,
    });

    vim.on('exit', (e, code) => {
      child_process.exec('cat .tmp/data', (err, stdout, stderr) => {
        if (err) {
          console.error(`exec error: ${err}`);
        }
        // console.log('data:');
        // console.log(`${stdout}`);
        resolve(stdout);
      });
    });
  });
}

async function main() {
  try {
    let data;
    data = await vim();
    data = await sh(`echo "${data}" | fzf -m`);
    // data = await sh(`echo "${data}" | fzf -m`);
    // await sh(`echo "${data}" > .vim`);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

main();
