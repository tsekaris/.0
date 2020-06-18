// https://github.com/junegunn/fzf/issues/662
// import { spawn } from 'child_process';
// den letourgei me es6

const { spawn } = require('child_process');

const entries = ['things', 'I', 'want', 'to', 'search'].join('\n');

// const fzf = spawn(`echo "${entries}" | fzf -m`, {
const fzf = spawn('fzf -m', {
  stdio: ['inherit', 'pipe', 'inherit'],
  shell: true,
});

fzf.stdout.setEncoding('utf-8');

fzf.stdout.on('readable', () => {
  const value = fzf.stdout.read();

  if (value !== null) {
    console.log(value);
  }
});
