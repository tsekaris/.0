// https://github.com/junegunn/fzf/issues/662
// import { spawn } from 'child_process';
// den letourgei me es6

const child_process = require('child_process');

function sh(req) {
  const child = child_process.spawnSync(req, {
    stdio: ['inherit', 'pipe', 'inherit'],
    shell: true,
    encoding: 'utf-8',
    env: process.env,
  });
  // slice: remove change line που προσθέτει στο stdout
  const out = child.stdout.slice(0, -1);
  let ok = false;
  if (child.status === 0) { ok = true; }

  return { ok, out };
}

function vim(file) {
  const child = child_process.spawnSync(`vim ${file}`, {
    stdio: 'inherit',
    shell: true,
    encoding: 'utf-8',
  });
}

function fzf(data) {
  const d = sh(`echo "${data.join('\n')}" | fzf -m`);
  d.out = d.out.split('\n');
  return d;
}

function ui(db) {
  // db = {message: 'text', choices: []}
  const data = sh(`echo "${db.choices.join('\n')}" | fzf --prompt "${db.message}" -m`);
  console.log(`${db.message} ${data.out}`);
  return data;
}

function main() {
  let data;
  vim('.vim');
  const msg = 'Η αγαπημένη σου ομάδα:';
  data = ui({
    message: 'H αγαπημένη σου ομάδα',
    choices: ['paok', 'aris', 'aek', 'osfp', 'new'],
  });
  console.log(data);
  data = sh(`cat .vim | fzf --prompt "${msg}" -m`);
  console.log(msg, data.out);
  data = ['πάοκ', 'άρης', 'όφη'];
  console.log(fzf(data));
}


function main2() {
  const inquirer = require('inquirer');

  inquirer
    .prompt([
      {
        type: 'editor',
        name: 'file',
        message: 'select file',
      },
      {
        type: 'list',
        name: 'theme',
        message: 'What do you want to do?',
        choices: [
          'Order a pizza',
          'Make a reservation',
          new inquirer.Separator(),
          'Ask for opening hours',
          {
            name: 'Contact support',
            disabled: 'Unavailable at this time',
          },
          'Talk to the receptionist',
        ],
      },
      {
        type: 'list',
        name: 'size',
        message: 'What size do you need?',
        choices: ['Jumbo', 'Large', 'Standard', 'Medium', 'Small', 'Micro'],
        filter(val) {
          return val.toLowerCase();
        },
      },
    ])
    .then((answers) => {
      console.log(JSON.stringify(answers, null, '  '));
    });
}

main2();
