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

async function mpcb({ amper = 0 } = {}) {
  // Μέχρι 100 A.
  // Αλλα πχ στα 99A Θεμομαγνητικό 80...100 Α. Πολύ οριακά.
  const ans = await database.all(`
        select * , max(a_max) as max from devices
        where type = 'mpcb' and a_min <= ${amper} and a_max > ${amper}
  `);
  delete ans[0].max;
  if (ans[0].id === null) {
    ans[0] = null;
  }
  return ans[0];
}

async function thr(dbIn) {
  try {
    const db = {
      amper: 2000,
      characteristic: 'el',
      rly: null,
      ...dbIn,
    };

    if (db.rly === null) {
      db.rly = await rly({ amper: db.amper });
    }

    const ans = await database.all(`
        select *, max(a_max) as max from devices, json_each(devices.data) as rly
        where devices.type = 'thr' and devices.characteristic = '${db.characteristic}' and rly.value = '${db.rly.name.split('-')[0]}' and a_min <= ${db.amper} and a_max > ${db.amper}
  `);
    ans[0].type = 'thr'; // Υπάρχει και στο json_each
    delete ans[0].max;
    delete ans[0].key;
    delete ans[0].value;
    delete ans[0].atom;
    delete ans[0].parent;
    delete ans[0].fullkey;
    delete ans[0].path;
    ans[0].rly = db.rly.name;

    if (ans[0].id === null) {
      ans[0] = null;
    }
    return ans[0];
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function cb(dbIn) {
  // Με el min = 0.4*max
  // Με mch (5 θέσεις) min = 0.7*max, mid = 0.85*max.
  // Γιαυτό τα amper < 0.85 * 0.85
  // Tα el έχουν μεγαλύτερο εύρος και ακρίβεια.
  // Και γιαυτά 0.85.
  const db = {
    amper: 0,
    poles: '3p',
    kA: 36,
    characteristic: 'el',
    ...dbIn,
  };

  const ans = await database.all(`
    select *, min(a_max) as min from devices
    where type = 'cb' and characteristic = '${db.characteristic}' and poles = '${db.poles}' and kA = ${db.kA} and a_max * 0.85 >= ${db.amper}
  `);
  delete ans[0].min;
  if (ans[0].id === null) {
    ans[0] = null;
  }
  return ans[0];
}

async function rly(dbIn) {
  // a_min: a_max του προυγούμενου ρελέ
  // στα amper καλύτερα να βάζεις τα amper του ασφαλιστικού και όχι του κινητήρα
  const db = {
    amper: 4000,
    poles: '3p',
    characteristic: 'ac3',
    ...dbIn,
  };


  if (db.characteristic === 'ac1') {
    // 3p πχ για αντιστάσεις
    db.amper *= 1.3;
  }

  const ans = await database.all(`
        select *, min(a_max) as min from devices
        where type = 'rly' and poles = '${db.poles}' and a_max * 0.8 >= ${db.amper}  
  `);
  delete ans[0].min;
  if (ans[0].id === null) {
    ans[0] = null;
  }
  return ans[0];
}

async function mcb(dbIn) {
  // a: 0.8 * a_max. Που έτσι και αλλιώς είναι μία κλάση παραπάνω
  const db = {
    amper: 4000,
    poles: '3p',
    characteristic: 'C',
    kA: 10,
    ...dbIn,
  };

  if (db.amper < 6) {
    // Τα 1, 2 και 4 δεν τα θέλω
    db.amper = 6;
  }

  const ans = await database.all(`
        select *, min(a_max) as min from devices
        where type = 'mcb' and poles = '${db.poles}' and kA = ${db.kA} and a_max * 0.8 >= ${db.amper}  
  `);
  delete ans[0].min;
  if (ans[0].id === null) {
    ans[0] = null;
  }
  return ans[0];
}


async function mpcb_rly(dbIn) {
  try {
    const db = {
      amper: 4000,
      ...dbIn,
    };
    let cb1;
    let rly1;

    cb1 = await mpcb({ amper: db.amper });
    rly1 = await rly({ amper: db.amper });

    return { cb1, rly1 };
  } catch (e) {
    return null;
  }
}

async function yYY(dbIn) {
  try {
    const db = {
      amper: 4000,
      ...dbIn,
    };
    let cb1;
    let rly1;
    let cb2;
    let rly2;

    cb1 = await mpcb({ amper: db.amper });
    cb2 = { ...cb1 };
    rly1 = await rly({ amper: db.amper });
    rly2 = { ...rly1 };
    return {
      cb1, rly1, cb2, rly2,
    };
  } catch (e) {
    return null;
  }
}

async function yD(dbIn) {
  try {
    const db = {
      amper: 4000,
      ...dbIn,
    };
    let cb1;
    let rlyMain;
    let rlyDelta;
    let rlyStar;
    let thr1;

    if (db.amper < 100) {
      cb1 = await mpcb({ amper: db.amper });
    } else {
      cb1 = await cb({ amper: db.amper });
    }
    rlyMain = await rly({ amper: db.amper * 0.58 });
    rlyDelta = { ...rlyMain };
    rlyStar = await rly({ amper: db.amper * 0.33 });

    thr1 = await thr({ amper: db.amper * 0.58, rly: rlyDelta });

    return {
      cb1, rlyMain, rlyDelta, rlyStar, thr1,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function main() {
  try {
    database = await sqlite.open({
      filename: './.tmp/abb.db',
      driver: sqlite3.cached.Database,
    });
    const nulls = [];
    const belowMin = [];
    const percent = [];

    for (let i = 1; i < 80; i++) {
      console.log();
      const device = await mcb({ amper: i });
      console.log();
      console.log(i);
      if (device === null) {
        nulls.push(i);
        console.log(device);
      } else {
        console.log('min:', device.a_min);
        console.log('max:', device.a_max);
        console.log(i / device.a_max);
        if (i - device.a_min < 0) {
          belowMin.push(i);
        }
      }
    }
    await database.close();

    console.log('nulls: ', nulls);
    console.dir(belowMin);
  } catch (error) {
    console.error(error);
  }
}


main();
