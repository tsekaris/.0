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
    // db = {message: 'text', choices: [], multi: true, index: 'show'}
    // multi: true τότε επιστρέφει array.
    // multi: false ή undefined τότε επιστρέφει τιμή.
    // Αν υπάρξει σφάλμα ή ακύρωση (esc, control-c) τότε επιστρέφει ''.
    // index: Αν υπάρχει τότε θα επιστρέψει την 1η "λέξη" που χωρίζεται με space.
    // index: 'show' Το index θα εμφανίστεί στον χρήστη.
    // index: 'hide' Το index δεν θα εμφανίστεί στον χρήστη.
    // bash status:
    // 0: Normal exit
    // 1: No match (αν θέλω να το χρησιμοποιώ σαν input)
    // 2: Error
    // 130: ctr-c or esc pressed

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

    let data = null;
    const command = [];
    const {
      choices = [],
      message = 'Εισαγωγή τιμής:',
      height = '80%',
      header = '',
      preview = { type: '', style: 'right:0%' },
      multi = false,
      defaults = [],
      validation = () => true,
    } = db;

    if (choices.length > 0) {
      // List

      let hasReturnedValues;
      if (Array.isArray(db.choices[0])) {
        // Τότε υπάρχει return value
        hasReturnedValues = true;
        choices = choices.map((choice, index) => `${index}\t${choice[0]}`).join('\n');
      } else {
        hasReturnedValues = false;
        choices = choices.map((choice, index) => `${index}\t${choice}`).join('\n');
      }
      command.push(
        `echo '${choices}' | fzf --cycle --print-query -d '\t' --color=bg+:-1 --with-nth=2 --prompt="${message}`,
      );
      command.push(`--height=${height}`);
      command.push(`--header='${header}'`);
      switch (preview.type) {
        case 'text':
          command.push('--preview="echo {3}"');
          break;
        case 'json':
          command.push('--preview="jq -Cn {3}"');
          break;
        case 'html':
          command.push('--preview="echo {3} | w3m -T text/html"');
          break;
        default:
        // undefined
      }
      command.push(`--preview-window=${preview.style}:wrap`);
      command.push(multi === true ? '--marker="+" -m' : '');

      // const scriptText = `echo '${choices}' | fzf ${height} ${header} --cycle --print-query -d '\t' --color=bg+:-1 --with-nth=2 --prompt="${db.message} " ${marker} ${preview}`;

      const script = this.run2(command.join(' '));

      if (script.status === 0) {
        data = script.out.split('\n');
        data.shift(); // To data χωρίς query
        data = data.map((record) => record.split('\t')); // array of array of strings
        if (data.length === 1) {
          console.log(message.cyan, `${data[0][1]}`.green);
          if (hasReturnedValues) {
            data = choices[data[0][0] * 1][1]; // eslint-disable-line prefer-destructuring
          } else {
            data = data[0][1]; // eslint-disable-line prefer-destructuring
          }
        } else if (data.length > 1) {
          console.log(message.cyan);
          data = data.map((record) => {
            console.log(`${record[1]}`.green);
            if (hasReturnedValues) {
              return choices[record[0] * 1][1]; // return της arrow function
            }
            return record[1]; // return της arrow function
          });
        }
      }
      if (data === null) {
        console.log(message.cyan, `${null}`.red);
      }
    } else {
      // Input

      if (defaults.length > 0) {
        const script = this.run2(
          `echo "-insert-\n${defaults.join(
            '\n',
          )}" | fzf --height=${height} --header=${header} --color=bg+:-1 --disabled --print-query --prompt "${message} "`,
        );
        console.log(script);
        if (script.status === 0) {
          data = script.out.split('\n');
          if (data[1] === '-insert-') {
            data = convert(data[0]);
          } else {
            // Πέρνουμε την επιλεγμένη default τιμή.
            data = convert(data[1]);
          }
        }
      } else {
        const script = this.run2(
          `echo "" | fzf --height=${height} --header=${header} --color=bg+:-1 --info=hidden --pointer=' ' --print-query --prompt "${message} "`,
        );
        if (script.status === 1 || script.status === 0) {
          // 1: Υπάρχει text, 0: Δεν υπάρχει text. Απλό enter
          // Δεν έχει επιλεχτεί τίποτα άρα πρέπει να δούμε το text που εισάγεται (query)
          data = script.out.split('\n');
          data = convert(data[0]);
        }
      }

      if (validation(data) === false) {
        if (data !== null) {
          console.log('Not a valid value.'.red);
          data = this.fzf(db);
          process.exit(1); // έξοδος από το πρόγραμμα
        }
      }

      if (data !== null) {
        console.log(message.cyan, `${data}`.green);
      } else {
        console.log(message.cyan, `${null}`.red);
      }
    }

    return data;
  },
  dummy() {
    // dummy
  },
};

module.exports = sh;
