// https://github.com/junegunn/fzf/issues/662
// import { spawn } from 'child_process';
// den letourgei me es6

const child_process = require('child_process');
const colors = require('colors');

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
    const sqlite3 = require('sqlite3').verbose();
    const { open } = require('sqlite');
    const inquirer = require('inquirer');
    const { prompt } = inquirer;

    const db = await open({
      filename: './.tmp/abb.db',
      driver: sqlite3.cached.Database,
    });

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
    sqlResult = await db.all(sql);
    promptData = {
      type: 'list',
      name: 'type',
      message: 'Type:',
      choices: sqlResult.map((element) => element.type),
    };

    const type = fzf(promptData).value;
    // const { type } = await prompt(promptData);

    sql = `select distinct poles  from devices where type = '${type}' and a_min <= ${amper} and a_max >= ${amper}`;
    sqlResult = await db.all(sql);
    promptData = {
      type: 'list',
      name: 'poles',
      message: 'Poles:',
      choices: sqlResult.map((element) => element.poles),
    };

    const poles = fzf(promptData).value;
    // const { poles } = await prompt(promptData);

    sql = `select distinct data from devices where type = '${type}' and poles = '${poles}' and a_min <= ${amper} and a_max >= ${amper}`;
    sqlResult = await db.all(sql);

    promptData = {
      type: 'list',
      name: 'data',
      message: 'Data:',
      choices: sqlResult.map((element) => element.data.replace('[', '').replace(']', '')),
    };

    let data = fzf(promptData).value;
    data = data.split(',');
    data = JSON.stringify(data);
    // const { data } = await prompt(promptData);

    sql = `select id, name, price from devices where type = '${type}' and poles = '${poles}' and data = '${data}' and a_min <= ${amper} and a_max >= ${amper}`;
    sqlResult = await db.all(sql);
    promptData = {
      type: 'list',
      name: 'selection',
      message: 'Select:',
      choices: sqlResult.map((element) => `${element.id} ${element.name} ${element.price}€`),
    };

    const selection = fzf(promptData).value;
    // const { selection } = await prompt(promptData);

    await db.close();
  } catch (error) {
    console.error(error);
  }
}

async function starter() {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const { open } = require('sqlite');
    const inquirer = require('inquirer');
    const { prompt } = inquirer;

    const db = await open({
      filename: './.tmp/abb.db',
      driver: sqlite3.cached.Database,
    });
    let sql;
    let sqlResult;

    const amper = fzf({
      message: 'Amper',
    }).value;
    sql = `select *, max(a_max) from devices where type = 'mpcb' and a_min <= ${amper} and a_max >= ${amper}`;
    sqlResult = await db.all(sql);
    const mpcb = sqlResult[0];
    delete mpcb['max(a_max)'];

    sql = `select *, max(a_max) from devices where type = 'rly' and a_min <= ${amper * 1.25} and a_max >= ${amper}`;
    sqlResult = await db.all(sql);
    const rly = sqlResult[0];
    delete rly['max(a_max)'];

    console.log('mpcb:', mpcb);
    console.log('rly:', rly);
  } catch (error) {
    console.error(error);
  }
}


// selectAmper();
starter();
