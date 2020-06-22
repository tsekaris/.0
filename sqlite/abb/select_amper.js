// https://github.com/junegunn/fzf/issues/662
// import { spawn } from 'child_process';
// den letourgei me es6

const child_process = require('child_process');

function sh(req) {
  const child = child_process.spawnSync(req, {
    stdio: ['inherit', 'pipe', 'inherit'],
    shell: true,
    encoding: 'utf-8',
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

function ui(db) {
  // db = {message: 'text', choices: []}

  let script;
  let data = [];
  let returnObj = {};

  if (db.choices !== undefined) {
    script = sh(`echo "${db.choices.join('\n')}" | fzf --prompt "${db.message} " --marker="+" -m`);
    if (script.ok) {
      // Έχει επιλεχτεί κάτι
      data = script.out.split('\n');
    } else {
      data = [];
    }
  } else {
    script = sh(`echo "" | fzf --info=hidden --pointer=' ' --print-query --prompt "${db.message} "`);
    data = script.out.split('\n');
    if (script.ok) {
      // Έχει επιλεχτεί το τίποτα
      data = [];
    } else {
      // Δεν έχει επιλεχτεί τίποτα άρα πρέπει να δούμε το text που εισάγεται (query)
      const input = data[0];
      data = [];
      if (input !== '') {
        data[0] = input;
      }
    }
  }
  if (data.length === 1) {
    console.log('\x1b[36m%s\x1b[0m', db.message);
    console.log('\x1b[32m%s\x1b[0m', data[0]);
    returnObj = {
      value: data[0],
      values: data,
      id: data[0].split(' ')[0],
      ids: data.map((text) => text.split(' ')[0]),
    };
  } else if (data.length === 0) {
    console.log('\x1b[31m%s\x1b[0m', db.message);
    returnObj = {
      value: null,
      values: null,
      id: null,
      ids: null,
    };
  } else {
    console.log('\x1b[36m%s\x1b[0m', db.message);
    data.forEach((element) => console.log('\x1b[32m%s\x1b[0m', element));
    returnObj = {
      value: data[0],
      values: data,
      id: data[0].split(' ')[0],
      ids: data.map((text) => text.split(' ')[0]),
    };
  }
  return returnObj;
}

function test_inquirer() {
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

function main() {
  const sqlite3 = require('sqlite3').verbose();

  const db = new sqlite3.Database('.tmp/abb.db');
  const amper = ui({ message: 'Amper:' }).value;
  let type;
  let poles;
  let filter;

  db.all('select distinct type  from devices where a_min <= $amper and a_max >= $amper', { $amper: amper }, (err, rows) => {
    type = ui({ message: 'type:', choices: rows.map((row) => row.type) }).value;
    db.all(`select distinct poles  from devices where type = '${type}' and a_min <= ${amper} and a_max >= ${amper}`, (err, rows) => {
      poles = ui({ message: 'poles:', choices: rows.map((row) => row.poles) }).value;
      db.all(`select distinct filter from devices where type = '${type}' and poles = '${poles}' and a_min <= ${amper} and a_max >= ${amper}`, (err, rows) => {
        filter = ui({ message: 'filter:', choices: rows.map((row) => row.filter) }).value;
        db.all(`select id, name, price from devices where type = '${type}' and poles = '${poles}' and filter  = '${filter}' and a_min <= ${amper} and a_max >= ${amper}`, (err, rows) => {
          ui({ message: 'select:', choices: rows.map((row) => `${row.id} ${row.name} ${row.price}`) }).value;
        });
      });
    });
  });
  /*
    */
  db.close();
}

main();
