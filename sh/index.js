const child_process = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fgBlack: '\x1b[30m',
  fgRed: '\x1b[31m',
  fgGreen: '\x1b[32m',
  fgYellow: '\x1b[33m',
  fgBlue: '\x1b[34m',
  fgMagenta: '\x1b[35m',
  fgCyan: '\x1b[36m',
  fgWhite: '\x1b[37m',

  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

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
    return { status, out, req };
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
    // bash status:
    // 0: Normal exit
    // 1: No match (αν θέλω να το χρησιμοποιώ σαν input)
    // 2: Error
    // 130: ctr-c or esc pressed
    const {
      message = 'Εισαγωγή τιμής:',
      header = '',
      query = '', // Για το input κυρίως. Η default τιμή.
      height = '80%',
      // list
      choices = [],
      multi = false,
      preview = { type: '', style: 'right:0%' },
      // input
      defaults = [],
      validation = () => true,
    } = db;

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

    const result = {
      message: 'null',
      data: null,
      log: () => {
        console.log(
          `${colors.fgCyan}${message}`,
          typeof result.message === 'string'
            ? `${colors.fgGreen}${result.message}${colors.reset}`
            : result.message,
        );
        if (result.data === null) {
          console.log(`${colors.fgRed}Canceled.${colors.reset}`);
        }
      },
    };

    if (choices.length > 0) {
      // List
      const hasReturnedValues = Array.isArray(choices[0]);
      const script = this.run2(
        [
          (() => {
            let fzfChoices;
            if (hasReturnedValues) {
              fzfChoices = choices.map((choice, index) => `${index}\t${choice[0]}`).join('\n');
            } else {
              fzfChoices = choices.map((choice, index) => `${index}\t${choice}`).join('\n');
            }
            return `echo '${fzfChoices}' |`;
          })(),
          'fzf',
          `--prompt "${message} "`,
          (() => {
            if (header === '') {
              return '';
            }
            return `--header='${header}'`;
          })(),
          `--query "${query}"`,
          `--height=${height}`,
          '--cycle',
          '--color=bg+:-1',
          '--print-query',
          "-d '\t'",
          '--with-nth=2',
          (() => {
            switch (preview.type) {
              case 'text':
                return '--preview="echo {3}"';
              case 'json':
                return '--preview="jq -Cn {3}"';
              case 'html':
                return '--preview="echo {3} | w3m -T text/html"';
              default:
                return '';
            }
          })(),
          `--preview-window=${preview.style}:wrap`,
          '--marker="+"',
          `${multi === true ? '-m' : ''}`,
        ].join(' '),
      );

      if (script.status === 0) {
        const returnValues = [];
        const returnTexts = [];
        const data = script.out.split('\n'); //  ['query', '8\tChoice1', '9\tChoice2']
        data.shift(); // ['8\tChoice1', '9\tChoice2']
        data.forEach((record) => {
          // record: '8\tChoice1'
          let [index, text] = record.split('\t');
          index *= 1; // Μετατροπή σε αριθμό.
          text = convert(text); // Μετατροπή σε json value.
          returnTexts.push(text);
          returnValues.push(hasReturnedValues ? choices[index][1] : text);
        });

        // Αν είναι μία η τιμή να μην εμαφανίζονται τα []
        result.message = returnTexts.length === 1 ? returnTexts[0] : returnTexts;

        // Αν είναι πολλαπλή επιστρέφει array ακόμα και όταν έχει επιλεχτεί 1.
        result.data = multi ? returnValues : returnValues[0];
      }
    } else {
      // Input
      const script = this.run2(
        [
          (() => {
            if (defaults.length > 0) {
              return `echo "-insert-\n${defaults.join('\n')}" | fzf `;
            }
            return 'echo "" | fzf --pointer=" "';
          })(),
          `--height=${height}`,
          (() => {
            if (header === '') {
              return '';
            }
            return `--header='${header}'`;
          })(),
          '--color=bg+:-1',
          '--info=hidden',
          '--disabled',
          '--print-query',
          `--prompt "${message} "`,
          `--query "${query}"`,
        ].join(' '),
      );
      if (script.status === 0 || script.status === 1) {
        // 1: Υπάρχει text, 0: Δεν υπάρχει text. Απλό enter
        // Δεν έχει επιλεχτεί τίποτα άρα πρέπει να δούμε το text που εισάγεται (query)
        const data = script.out.split('\n');
        switch (data[1]) {
          case '-insert-':
            result.data = convert(data[0]);
            break;
          case '-vim-':
            result.data = convert(this.vim(data[0]));
            break;
          default:
            result.data = defaults.length > 0 ? convert(data[1]) : convert(data[0]);
        }
        result.message = result.data;
      }

      if (validation(result.data) === false) {
        if (result.data !== null) {
          result.message = `${result.data}\n${colors.fgRed}Not a valid value. Try again.`;
          result.log();
          result.data = this.fzf(db);
          process.exit(1); // έξοδος από το πρόγραμμα
        }
      }
    }
    result.log();
    return result.data;
  },
};

module.exports = sh;
