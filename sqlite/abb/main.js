// https://github.com/junegunn/fzf/issues/662
// import { spawn } from 'child_process';
// den letourgei me es6

const child_process = require('child_process');
const colors = require('colors');
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite'); // sqlite with promises
const inquirer = require('inquirer');

let database; // Ορίζεται στην main

const { prompt } = inquirer;

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

function fzf(db) {
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
    script = sh(`echo "" | fzf --color=bg+:-1 --info=hidden --pointer=' ' --print-query --prompt "${db.message} "`);
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
    console.log(db.message.cyan, data[0].green);
    returnObj = {
      value: data[0],
      values: data,
      id: data[0].split(' ')[0],
      ids: data.map((text) => text.split(' ')[0]),
    };
  } else if (data.length === 0) {
    console.log(db.message.red.underline);
    returnObj = {
      value: null,
      values: null,
      id: null,
      ids: null,
    };
  } else {
    console.log(db.message.cyan);
    data.forEach((element) => console.log(element.green));
    returnObj = {
      value: data[0],
      values: data,
      id: data[0].split(' ')[0],
      ids: data.map((text) => text.split(' ')[0]),
    };
  }
  return returnObj;
}

async function selectAmper() {
  try {
    let sql = '';
    let sqlResult;
    let promptData; // Το έκανα για να πειραματίζομαι με inquirer και με το fzf

    promptData = {
      type: 'input',
      name: 'amper',
      message: 'Amper:',
    };

    const amper = fzf(promptData).value;
    // const { amper } = await prompt(promptData);

    sql = `select distinct type  from devices where a_min <= ${amper} and a_max >= ${amper}`;
    sqlResult = await database.all(sql);
    promptData = {
      type: 'list',
      name: 'type',
      message: 'Type:',
      choices: sqlResult.map((element) => element.type),
    };

    const type = fzf(promptData).value;
    // const { type } = await prompt(promptData);

    sql = `select distinct poles  from devices where type = '${type}' and a_min <= ${amper} and a_max >= ${amper}`;
    sqlResult = await database.all(sql);
    promptData = {
      type: 'list',
      name: 'poles',
      message: 'Poles:',
      choices: sqlResult.map((element) => element.poles),
    };

    const poles = fzf(promptData).value;
    // const { poles } = await prompt(promptData);

    sql = `select distinct kA from devices where type = '${type}' and poles = '${poles}' and a_min <= ${amper} and a_max >= ${amper}`;
    sqlResult = await database.all(sql);

    promptData = {
      type: 'list',
      name: 'kA',
      message: 'kA:',
      choices: sqlResult.map((element) => element.data.replace('[', '').replace(']', '')),
    };

    let data = fzf(promptData).value;
    data = data.split(',');
    data = JSON.stringify(data);
    // const { data } = await prompt(promptData);

    sql = `select id, name, price from devices where type = '${type}' and poles = '${poles}' and data = '${data}' and a_min <= ${amper} and a_max >= ${amper}`;
    sqlResult = await database.all(sql);
    promptData = {
      type: 'list',
      name: 'selection',
      message: 'Select:',
      choices: sqlResult.map((element) => `${element.id} ${element.name} ${element.price}€`),
    };

    const selection = fzf(promptData).value;
    // const { selection } = await prompt(promptData);
  } catch (error) {
    console.error(error);
  }
}

// select *, (0.8 - 1.0*(${amper}-a_min )/(a_max-a_min)) as test from devices
async function mpcb(amper = fzf({ message: 'Amper' }).value) {
  const ans = await database.all(`
        select * from devices
        where type = 'mpcb' and a_min <= ${amper} and a_max >= ${amper}
      `);
  console.log(ans);
}

async function cb(...dbIn) {
  const db = {
    poles: '3p',
    kA: 36,
    characteristic: 'mch',
    ...dbIn,
  };
  db.amper = db.amper || fzf({ message: 'Amper' }).value;

  const ans = await database.all(`
        select * from devices
        where type = 'cb' and poles = '${db.poles}' and kA = ${db.kA} and a_min+(a_max - a_min)/5 <= ${db.amper} and a_min+4*(a_max - a_min)/5>= ${db.amper}
      `);
  console.log(ans.length);
  console.log(ans);
}

async function main() {
  try {
    database = await sqlite.open({
      filename: './.tmp/abb.db',
      driver: sqlite3.cached.Database,
    });

    await cb();

    await database.close();
  } catch (error) {
    console.error(error);
  }
}


main();
