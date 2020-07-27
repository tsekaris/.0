/* eslint-disable max-classes-per-file */
// Το παραπάνω ενεργοποιήθηκε από το babel-eslint
// Το babel-eslint το εγκατεέστησα για να δημιουργώ class properties χωρίς this.

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

const sel = {
  database: null,

  async open() {
    // Ανοίγει την βάση δεδομένων
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
    // Κλείνει την βάση δεδομένων
    try {
      await this.database.close();
      this.database = null;
    } catch (e) {
      console.log(e);
    }
  },

  async all({ type = 'mcb', ...data }) {
    // Εμφανίζει όλες τι επιλογές από ένα type.
    // a: Τα amper της τελευταίας επιλογής.
    // Promise.all βγάζει προειδοποίηση για memory leak
    const aMax = data.a;
    try {
      const promises = [];
      for (let i = 1; i <= aMax; i += 1) {
        promises.push(this[type]({ ...data, a: i }));
      }
      const devices = await Promise.all(promises);
      devices.forEach((device, index) => {
        device.a = index;
        console.log(device);
      });
      // console.log(devices);
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
          kA: d.kA,
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
  volt(type, clients = 0) {
    return {
      type,
      clients,
    };
  },
};

async function yYY({ a = 0, cb = {}, rly = {} }) {
  try {
    // p for page
    const p = {};
    p.cb1 = await sel.mpcb({ a, ...cb });
    p.rly1 = await sel.rly({ a, ...rly });
    p.cb2 = { ...p.cb1 };
    p.rly2 = { ...p.rly1 };
    return p;
  } catch (e) {
    return null;
  }
}

async function yD({ a = 0, cb = {}, thr = {} } = {}) {
  try {
    let cb1;
    let rlyMain;
    let rlyDelta;
    let rlyStar;
    let thr1;

    rlyMain = await sel.rly({ a: a * 0.58 });
    rlyDelta = { ...rlyMain };
    rlyStar = await sel.rly({ a: a * 0.33 });
    if (a < 100) {
      cb1 = await sel.mpcb({ a });
      return {
        a,
        cb1,
        rlyMain,
        rlyDelta,
        rlyStar,
      };
    }
    cb1 = await sel.cb({ a, ...cb });
    thr1 = await sel.thr({ a: a * 0.58, rly: rlyDelta, ...thr });
    return {
      a,
      cb1,
      rlyMain,
      rlyDelta,
      rlyStar,
      thr1,
    };
  } catch (e) {
    return null;
  }
}

async function mpcbRly({ a = 0 } = {}) {
  // 3p+pe -> mpcb1.3p -> rly1.3p -> x.3p+pe -> moter.3p+pe
  // dcL -> mpcb1.no -> di1
  // dcL -> rly1.no -> di2
  // do1 -> mrly1.coil -> dcM
  // acL -> mrly1.no -> rly1.coil -> acN
  try {
    const mpcb1 = await sel.mpcb({ a });
    const rly1 = await sel.rly({ a });
    return { a, mpcb1, rly1 };
  } catch (e) {
    return null;
  }
}

async function simpleStarter({ motors = 1, a = 0 } = {}) {
  try {
    if (motors === 1) {
      const mpcb = await sel.mpcb({ a });
      const rly = await sel.rly({ a });
      return { a, mpcb, rly };
    }
    const aTotal = a * motors;
    const mcb = await sel.mcb({ a: aTotal });
    const rly = await sel.rly({ a: aTotal });
    const mpcbs = Array(motors).fill(await sel.mpcb({ a }));
    return {
      a,
      aTotal,
      mcb,
      rly,
      mpcbs,
    };
  } catch (e) {
    return null;
  }
}
class Page {
  constructor({ id, text } = {}) {
    this.id = id;
    this.text = text;
    this.elements = {};
  }

  draw(x = 0, y = 0) {
    this.xStart = x;
    this.x = x;
    this.y = y;
    return this;
  }

  cell(width = 1) {
    this.x += width;
    return this;
  }

  row() {
    this.x = this.xStart;
    this.y += 1;
    return this;
  }

  main(type, id, data = {}) {
    const w = data.w || 1; // width
    const h = data.x || 1; // height
    const name = type + id;
    this.elements[name] = {
      x: this.x,
      y: this.y,
      w,
      h,
      name,
      type,
      ...data,
      subs: [],
    };
    this.x += w;
    return this;
  }

  sub(mainName, name, data = {}) {
    const w = data.w || 1; // width
    const h = data.h || 1; // height
    this.elements[mainName].subs.push({ name, x: this.x, y: this.y });
    this.x += w;
    return this;
  }

  ext(type, id, data = {}) {
    const w = data.w || 1; // width
    const h = data.h || 1; // height
    const name = type + id;
    this.elements[name] = {
      x: this.x,
      y: this.y,
      w,
      h,
      name,
      type,
      ...data,
    };
    this.x += w;
    return this;
  }
}

// sel.all({ type: 'cb', kA: 50, a: 10 });
//
async function main() {
  // const devices = await yYY({ a: 10 });
  // console.log(devices);
  const p1 = new Page({ id: 1, text: 'Paokara' });

  p1.draw(0, 0)
    .ext('l')
    .ext('l2')
    .ext('l3')
    .row()
    .main('mpcb', 1, {
      w: 3,
      p: '3p',
      no: 1,
    })
    .row()
    .main('rly', 1, {
      w: 3,
      p: '3p',
      no: 1,
    });
  p1.draw(4, 0)
    .ext('dcL', { type: 'dcL' })
    .row()
    .sub('mpcb1', 'no1')
    .row()
    .ext('di1', { type: 'di' })
    .row()
    .row()
    .ext('do1', { type: 'do' })
    .row()
    .main('mrly', 1, { volts: 'dcL', no: 1 })
    .row()
    .ext('dcM', { type: 'dcM' });
  p1.draw(5, 0)
    .ext('dcL', { type: '24 dc' })
    .row()
    .sub('rly1', 'no1')
    .row()
    .ext('di2', { type: 'di' })
    .row()
    .ext('acL', { type: 'acL' })
    .sub('mrly1', 'no1')
    .sub('rly1', 'coil')
    .ext('acN', { type: 'acN' });
  console.log(JSON.stringify(p1, null, ' '));
}

main();
