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
    // db = {message: 'text', choices: [], multi: true, onError = function(), field: 2}
    // Αν είναι multi: true τότε επιστρέφει array από strings.
    // Αν δεν είναι multi: true τότε επιστρέφει string τιμή.
    // Αν υπάρξει σφάλμα ή ακύρωση (esc, control-c) τότε επιστρέφει null.
    // Sample: μόνο για input validation
    // bash status:
    // 0: Normal exit
    // 1: No match (αν θέλω να το χρησιμοποιώ σαν input)
    // 130: ctr-c or esc pressed

    let mode;
    let script;

    function convert(value) {
      let valueToNumber;
      switch (value) {
        case '':
          // δίνει 0 όταν *1
          return value;
        case 'true':
          return true;
        case 'false':
          return false;
        default:
          valueToNumber = value * 1;
          if (Number.isNaN(valueToNumber)) {
            return value;
          }
          return valueToNumber;
      }
    }

    if (db.choices !== undefined) {
      if (db.multi === true) {
        // Πολλαπλή επιλογή απο λίστα.
        mode = 'list-multi';
        script = this.run2(
          `echo "${db.choices.join('\n')}" | fzf --prompt "${db.message} " --marker="+" -m`,
        );
      } else {
        // Απλή επιλογή απο λίστα.
        mode = 'list';
        script = this.run2(`echo "${db.choices.join('\n')}" | fzf --prompt "${db.message} "`);
      }
    } else {
      // Input
      mode = 'input';
      script = this.run2(
        `echo "" | fzf --color=bg+:-1 --info=hidden --pointer=' ' --print-query --prompt "${db.message} "`,
      );
    }

    let data = script.out.split('\n');

    if (db.field !== undefined) {
      // Για επιστρέφει μία λέξη απο το string του fzf (πχ id)
      data = data.map((record) => convert(record.split(' ')[db.field]));
    } else {
      data = data.map((record) => convert(record));
    }

    switch (mode) {
      case 'list':
        if (script.status === 0) {
          console.log(db.message.cyan, `${data[0]}`.green);
          return data[0];
        }
        break;
      case 'list-multi':
        if (script.status === 0) {
          if (data.length > 1) {
            // Αν είναι πολλαπλή επιλογή, οι επιλογές εμφανίζονται σε διαφορετικές σειρές
            console.log(db.message.cyan);
            data.forEach((element) => {
              console.log(`${element}`.green);
            });
            return data;
          }
          // Αν δεν είναι πολλαπλή επιλογή, η επιλογή στην ίδια σειρά με το μήνυμα
          console.log(db.message.cyan, `${data[0]}`.green);
          return data;
        }
        break;
      case 'input':
        if (script.status === 1) {
          // Δεν έχει επιλεχτεί τίποτα άρα πρέπει να δούμε το text που εισάγεται (query)
          console.log(db.message.cyan, `${data[0]}`.green);
          return data[0];
        }
        break;
      default:
        console.log(db.message.red.underline);
        return '';
    }
    console.log(db.message.red.underline);
    return '';
  },
};

module.exports = sh;
