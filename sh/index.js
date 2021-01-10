const child_process = require('child_process');
const colors = require('colors');

const sh = {
  run(req) {
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
  },

  vim(text) {
    // απαιτείται εγκατάσταση του vipe
    return this.run(`echo "${text}" | vipe `);
  },

  fzf(db) {
    // db = {message: 'text', choices: []}

    let script;
    let data = [];

    if (db.choices !== undefined) {
      script = this.run(
        `echo "${db.choices.join('\n')}" | fzf --prompt "${db.message} " --marker="+" -m`,
      );
      if (script.ok) {
        // Έχει επιλεχτεί κάτι
        data = script.out.split('\n');
      } else {
        data = [];
      }
    } else {
      script = this.run(
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
      return {
        value: data[0],
        values: data,
        id: data[0].split(' ')[0],
        ids: data.map((text) => text.split(' ')[0]),
      };
    }
    if (data.length === 0) {
      console.log(db.message.red.underline);
      return {
        value: null,
        values: null,
        id: null,
        ids: null,
      };
    }
    console.log(db.message.cyan);
    data.forEach((element) => console.log(element.green));
    return {
      value: data[0],
      values: data,
      id: data[0].split(' ')[0],
      ids: data.map((text) => text.split(' ')[0]),
    };
  },
};

module.exports = sh;
