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

    if (db.choices !== undefined) {
      // List

      // Choices
      let choices;
      let hasPreview;
      let hasReturnedValues;
      const sample = db.choices[0]; // ? Πρέπει να αλλάξει γιατί μπορεί να μην είναι αντιπροσωπευτικό
      if (Array.isArray(sample)) {
        // Τότε υπάρχει return value
        hasReturnedValues = true;
        hasPreview = sample[0].split('\t')[1] !== undefined;
        choices = db.choices.map((choice, index) => `${index}\t${choice[0]}`).join('\n');
      } else {
        hasReturnedValues = false;
        hasPreview = sample.split('\t')[1] !== undefined;
        choices = db.choices.map((choice, index) => `${index}\t${choice}`).join('\n');
      }

      // --preview
      let preview = '';
      if (hasPreview) {
        switch (db.preview) {
          case 'text':
            preview = '--preview="echo {3}"';
            break;
          case 'json':
            preview = '--preview="jq -Cn {3}"';
            break;
          case 'html':
            preview = '--preview="echo {3} | w3m -T text/html"';
            break;
          default:
            preview = '--preview="echo {3}"';
        }
      }

      // --marker //db.multi
      const marker = db.multi === true ? '--marker="+" -m' : '';
      // this.run2('echo ')

      const scriptText = `echo '${choices}' | fzf --height=90% --cycle --print-query -d '\t' --color=bg+:-1 --with-nth=2 --prompt="${db.message} " ${marker} ${preview} --preview-window=right:80%:wrap`;
      // --preview-window=up:50%:wrap

      const script = this.run2(scriptText);

      if (script.status === 0) {
        let data = script.out.split('\n');
        data.shift(); // To data χωρίς query
        data = data.map((record) => record.split('\t')); // array of array of strings
        if (data.length === 1) {
          console.log(db.message.cyan, `${data[0][1]}`.green);
          if (hasReturnedValues) {
            return db.choices[data[0][0] * 1][1];
          }
          return data[0][1];
        }
        if (data.length > 1) {
          console.log(db.message.cyan);
          data = data.map((record) => {
            console.log(`${record[1]}`.green);
            if (hasReturnedValues) {
              return db.choices[record[0] * 1][1]; // return της arrow function
            }
            return record[1]; // return της arrow function
          });
          return data;
        }
      }
    } else {
      this.dummy(); // για eslint: no-lonely-if
      // Input
      if (db.defaults !== undefined) {
        const script = this.run2(
          `echo "-insert-\n${db.defaults.join(
            '\n',
          )}" | fzf --height=50% --color=bg+:-1 --disabled --print-query --prompt "${db.message} "`,
        );
        if (script.status === 0) {
          const data = script.out.split('\n');
          if (data[1] === '-insert-') {
            if (data[0] !== '') {
              // Πέρνουμε το query
              console.log(db.message.cyan, `${data[0]}`.green);
              return convert(data[0]);
            }
          } else {
            // Πέρνουμε την επιλεγμένη default τιμή.
            console.log(db.message.cyan, `${data[1]}`.green);
            return convert(data[1]);
          }
        }
      } else {
        const script = this.run2(
          `echo "" | fzf --height=50% --color=bg+:-1 --info=hidden --pointer=' ' --print-query --prompt "${db.message} "`,
        );
        if (script.status === 1) {
          // Δεν έχει επιλεχτεί τίποτα άρα πρέπει να δούμε το text που εισάγεται (query)
          const data = script.out.split('\n')[0];
          console.log(db.message.cyan, `${data}`.green);
          return convert(data);
        }
      }
    }

    // Αν φτάσουμε εδώ υπάρχει σφάλμα
    // console.log(db.message.red.underline, `${null}`.red);
    console.log(db.message.cyan, `${null}`.red);
    return null;
  },
  dummy() {
    // dummy
  },
};

module.exports = sh;
