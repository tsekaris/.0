// https://github.com/junegunn/fzf/issues/662
// import { spawn } from 'child_process';
// den letourgei me es6

const child_process = require('child_process');
const colors = require('colors');
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite'); // sqlite with promises
const inquirer = require('inquirer');

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
  if (child.status === 0) {
    ok = true;
  }

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
    script = sh(
      `echo "" | fzf --color=bg+:-1 --info=hidden --pointer=' ' --print-query --prompt "${db.message} "`,
    );
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

    sql = `select distinct type  from devices where aMin <= ${amper} and aMax >= ${amper}`;
    sqlResult = await database.all(sql);
    promptData = {
      type: 'list',
      name: 'type',
      message: 'Type:',
      choices: sqlResult.map((element) => element.type),
    };

    const type = fzf(promptData).value;
    // const { type } = await prompt(promptData);

    sql = `select distinct poles  from devices where type = '${type}' and aMin <= ${amper} and aMax >= ${amper}`;
    sqlResult = await database.all(sql);
    promptData = {
      type: 'list',
      name: 'poles',
      message: 'Poles:',
      choices: sqlResult.map((element) => element.poles),
    };

    const poles = fzf(promptData).value;
    // const { poles } = await prompt(promptData);

    sql = `select distinct kA from devices where type = '${type}' and poles = '${poles}' and aMin <= ${amper} and aMax >= ${amper}`;
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

    sql = `select id, name, price from devices where type = '${type}' and poles = '${poles}' and data = '${data}' and aMin <= ${amper} and aMax >= ${amper}`;
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

const sel = {
  database: null,

  async open() {
    try {
      this.database = await sqlite.open({
        filename: './.tmp/abb.db',
        driver: sqlite3.cached.Database,
      });
    } catch (e) {
      this.database = null;
    }
  },

  async close() {
    try {
      await this.database.close();
      this.database = null;
    } catch (e) {
      console.log(e);
    }
  },

  async all({ type = 'mcb', n = 100 }) {
    try {
      const promises = [];
      for (let i = 1; i <= n; i += 1) {
        promises.push(this[type]({ a: i }));
      }
      const devices = await Promise.all(promises);
      devices.forEach((device, index) => {
        console.log(index, device.name);
      });
    } catch (e) {
      console.log(e);
    }
  },

  async sql(text) {
    try {
      if (this.database === null) {
        await this.open();
      }
      const d = (await this.database.all(text))[0];
      if (d.id !== null) {
        return {
          id: d.id,
          name: d.name,
          price: d.price,
          type: d.type,
          p: d.p,
          aMin: d.aMin,
          aMax: d.aMax,
          ch: d.ch,
          data: d.data,
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async mcb({
    a = 0, p = '3p', ch = 'C', kA = 10,
  } = {}) {
    // a: 0.8 * aMax. Που έτσι και αλλιώς είναι μία κλάση παραπάνω
    let amper = a;
    try {
      if (amper < 6) {
        // Τα 1, 2 και 4 δεν τα θέλω
        amper = 6;
      }

      return await this.sql(`
        select *, min(aMax) as min from devices
        where type = 'mcb' 
        and p = '${p}'
        and ch = '${ch}'
        and kA = ${kA} 
        and aMax * 0.8 >= ${amper}  
      `);
    } catch (e) {
      return null;
    }
  },

  async cb({
    a = 0, p = '3p', kA = 36, ch = 'el',
  } = {}) {
    // Με el min = 0.4*max
    // Με mch (5 θέσεις) min = 0.7*max, mid = 0.85*max.
    // Γιαυτό τα a < 0.85 * a
    // Tα el έχουν μεγαλύτερο εύρος και ακρίβεια.
    // Και γιαυτά 0.85.

    try {
      return await this.sql(`
        select *, min(aMax) from devices
        where type = 'cb'
        and ch = '${ch}'
        and p = '${p}'
        and kA = ${kA}
        and aMax * 0.85 >= ${a}
      `);
    } catch (e) {
      return null;
    }
  },

  async mpcb({ a = 0 } = {}) {
    try {
      return await this.sql(`
        select * , max(aMax) from devices
        where type = 'mpcb'
        and aMin <= ${a}
        and aMax > ${a}
      `);
    } catch (e) {
      return null;
    }
  },

  async rly({ a = 0, p = '3p', ch = 'ac3' } = {}) {
    // aMin: aMax του προυγούμενου ρελέ
    // στα a καλύτερα να βάζεις τα a του ασφαλιστικού και όχι του κινητήρα
    try {
      let amper = a;

      if (ch === 'ac1') {
        // για αντιστάσεις
        amper /= 1.3;
      }
      return await this.sql(`
        select *, min(aMax) from devices
        where type = 'rly'
        and p = '${p}'
        and aMax * 0.8 >= ${amper}  
      `);
    } catch (e) {
      return null;
    }
  },

  async thr({ a = 0, ch = 'el', rly = {} } = {}) {
    try {
      let rlyName;
      if (rly.name === undefined) {
        const d = await this.rly({ a });
        rlyName = d.name;
      } else {
        rlyName = rly.name;
      }

      return await this.sql(`
        select devices.*, max(aMax) from devices, json_each(devices.data) as rly
        where devices.type = 'thr'
        and devices.ch = '${ch}'
        and rly.value = '${rlyName.split('-')[0]}'
        and aMin <= ${a}
        and aMax > ${a}
     `);
    } catch (e) {
      return null;
    }
  },
};

async function mpcb_rly(dbIn) {
  try {
    const db = {
      a: 0,
      ...dbIn,
    };
    let cb1;
    let rly1;

    cb1 = await mpcb({ a: db.a });
    rly1 = await rly({ a: db.a });

    return { cb1, rly1 };
  } catch (e) {
    return null;
  }
}

async function yYY(dbIn) {
  try {
    const db = {
      a: 0,
      ...dbIn,
    };
    let cb1;
    let rly1;
    let cb2;
    let rly2;

    cb1 = await mpcb({ a: db.a });
    cb2 = { ...cb1 };
    rly1 = await rly({ a: db.a });
    rly2 = { ...rly1 };
    return {
      cb1,
      rly1,
      cb2,
      rly2,
    };
  } catch (e) {
    return null;
  }
}

async function yD(dbIn) {
  try {
    const db = {
      a: 0,
      ...dbIn,
    };
    let cb1;
    let rlyMain;
    let rlyDelta;
    let rlyStar;
    let thr1;

    if (db.a < 100) {
      cb1 = await mpcb({ a: db.a });
    } else {
      cb1 = await cb({ a: db.a });
    }
    rlyMain = await rly({ a: db.a * 0.58 });
    rlyDelta = { ...rlyMain };
    rlyStar = await rly({ a: db.a * 0.33 });

    thr1 = await thr({ a: db.a * 0.58, rly: rlyDelta });

    return {
      cb1,
      rlyMain,
      rlyDelta,
      rlyStar,
      thr1,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
}

sel.all({ type: 'rly', n: 200 });
