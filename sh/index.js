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
      if (db.multi === true) {
        // Πολλαπλή επιλογή απο λίστα.
        const script = this.run2(
          `echo "${db.choices.join('\n')}" | fzf  --with-nth ${
            db.index === 'hide' ? '2..' : '..'
          } --prompt "${db.message} " --marker="+" -m`,
        );
        if (script.status === 0) {
          const data = script.out.split('\n');
          switch (db.index) {
            case 'hide':
              if (data.length > 1) {
                // Αν είναι πολλαπλή επιλογή, οι επιλογές εμφανίζονται σε διαφορετικές σειρές
                console.log(db.message.cyan);
                data.forEach((element) => {
                  console.log(`${element.split(' ').slice(1).join(' ')}`.green);
                });
              } else {
                console.log(db.message.cyan, `${data[0].split(' ').slice(1).join(' ')}`.green);
              }
              return data.map((record) => convert(record.split(' ')[0]));
            case 'show':
              if (data.length > 1) {
                // Αν είναι πολλαπλή επιλογή, οι επιλογές εμφανίζονται σε διαφορετικές σειρές
                console.log(db.message.cyan);
                data.forEach((element) => {
                  console.log(`${element}`.green);
                });
              } else {
                console.log(db.message.cyan, `${data[0]}`.green);
              }
              return data.map((record) => convert(record.split(' ')[0]));
            default:
              if (data.length > 1) {
                // Αν είναι πολλαπλή επιλογή, οι επιλογές εμφανίζονται σε διαφορετικές σειρές
                console.log(db.message.cyan);
                data.forEach((element) => {
                  console.log(`${element}`.green);
                });
              } else {
                console.log(db.message.cyan, `${data[0]}`.green);
              }
              return data.map((record) => convert(record));
          }
        }
      } else {
        // Απλή επιλογή απο λίστα.
        const script = this.run2(
          `echo "${db.choices.join('\n')}" | fzf  --with-nth ${
            db.index === 'hide' ? '2..' : '..'
          } --prompt "${db.message} "`,
        );
        if (script.status === 0) {
          const data = script.out.split('\n')[0];
          switch (db.index) {
            case 'hide':
              console.log(db.message.cyan, `${data.split(' ').slice(1).join(' ')}`.green);
              return convert(data.split(' ')[0]);
            case 'show':
              console.log(db.message.cyan, `${data}`.green);
              return convert(data.split(' ')[0]);
            default:
              console.log(db.message.cyan, `${data}`.green);
              return convert(data);
          }
        }
      }
    } else {
      // Input
      const script = this.run2(
        `echo "" | fzf --color=bg+:-1 --info=hidden --pointer=' ' --print-query --prompt "${db.message} "`,
      );
      if (script.status === 1) {
        const data = script.out.split('\n')[0];
        // Δεν έχει επιλεχτεί τίποτα άρα πρέπει να δούμε το text που εισάγεται (query)
        console.log(db.message.cyan, `${data}`.green);
        return convert(data);
      }
    }

    // Αν φτάσουμε εδώ υπάρχει σφάλμαε
    console.log(db.message.red.underline);
    return null;
  },
};

module.exports = sh;
