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

  run2(req) {
    const child = child_process.spawnSync(req, {
      stdio: ['inherit', 'pipe', 'inherit'],
      shell: true,
      encoding: 'utf-8',
    });
    // slice: remove change line που προσθέτει στο stdout
    const out = child.stdout.slice(0, -1);
    const { status } = child;
    return { status, out };
  },

  vim(data) {
    // cat db.json | jq -c '.invoices[]' | fzf --preview 'echo {} | jq'
    // data: string ή object
    // απαιτείται εγκατάσταση του vipe
    // Απαραίτητο το '' στο echo γιατί αλλιώς χάνονται τα "" από το json.
    switch (typeof data) {
      case 'string':
        return this.run2(`echo '${data}' | vipe `).out;
      case 'object':
        return JSON.parse(
          this.run2(`echo '${JSON.stringify(data, null, 2)}' | vipe --suffix json`).out,
        );
      default:
        return '';
    }
    // Χωρίς vipe
    // Απαραίτητα τα /dev/tty γιατί αλλιώς δεν εμφανίζει τίποτα στο vim
    // return this.run(
    // `echo '${objJson}' > vim.json; vim vim.json < /dev/tty > /dev/tty`,
    // );
  },

  fzf(db) {
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

  fzf2(db) {
    // db = {message: 'text', choices: [], multi: true, id: true}
    // Αν είναι multi: true τότε επιστρέφει array από strings.
    // Αν δεν είναι multi: true τότε επιστρέφει string τιμή.
    // Αν υπάρξει σφάλμα ή ακύρωση (esc, control-c) τότε επιστρέφει null.

    let data = [];
    if (db.choices !== undefined) {
      // Επιλογή από λίστα.
      let script;
      if (db.multi === true) {
        // Πολλαπλή επιλογή απο λίστα.
        script = this.run2(
          `echo "${db.choices.join('\n')}" | fzf --prompt "${db.message} " --marker="+" -m`,
        );
      } else {
        script = this.run2(`echo "${db.choices.join('\n')}" | fzf --prompt "${db.message} "`);
      }
      if (script.status === 0) {
        // Έχει επιλεχτεί κάτι
        data = script.out.split('\n');
        if (db.multi === true && data.length > 1) {
          // Αν είναι πολλαπλή επιλογή, οι επιλογές εμφανίζονται σε διαφορετικές σειρές
          console.log(db.message.cyan);
          data.forEach((element) => console.log(element.green));
          return data;
        }
        // Αν δεν είναι πολλαπλή επιλογή, οι επιλογή στην ίδια σειρά με το μήνυμα
        console.log(db.message.cyan, data[0].green);
        return data[0];
      }
      console.log(db.message.red.underline);
      return null;
    }
    // Απλό input χωρίς επιλογές.
    const script = this.run2(
      `echo "" | fzf --color=bg+:-1 --info=hidden --pointer=' ' --print-query --prompt "${db.message} "`,
    );
    if (script.status === 1) {
      // Δεν έχει επιλεχτεί τίποτα άρα πρέπει να δούμε το text που εισάγεται (query)
      data = script.out.split('\n');
      console.log(db.message.cyan, data[0].green);
      return data[0];
    }
    console.log(db.message.red.underline);
    return null;
  },
};

module.exports = sh;
