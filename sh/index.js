const { rejects } = require('assert');
const childProcess = require('child_process');
const { resolve } = require('dns');
const { basename } = require('path');

const sh = {
  colors: {
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
  },

  run(req) {
    const child = childProcess.spawnSync(req, {
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
    const child = childProcess.spawnSync(req, {
      stdio: ['inherit', 'pipe', 'inherit'],
      // shell: true,
      shell: '/bin/bash', // Αλλιώς με true παίρνει sh.
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
      type = 'input',
      message = 'Εισαγωγή τιμής:',
      header = '',
      preset = '', // Για το input κυρίως. Η default τιμή.  query για fzf.
      height = '80%',
      choices = [],
      // list
      preview = { type: '', style: 'right:0%' },
      // input
      validation = () => true,
      onAnswer = () => {},
    } = db;

    // #todo
    // preset -> ? το default είναι δεσμευμένη από το σύστημα
    // preview: κάτι πρέπει να γίνει.
    // preview: Μήπως να βγαίνει και για το input πχ για μεγάλα κείμενα.
    // preview: με προσωρινά εξωτερικά αρχεία.
    // validation: Και για list.

    function convert(value) {
      // Επιστρέφει text ή number
      const valueToNumber = value * 1;
      if (Number.isNaN(valueToNumber) || value === '') {
        // το '' δίνει 0 όταν *1
        return value;
      }
      return valueToNumber;
    }

    const result = {
      message: 'null',
      data: null,
      log: () => {
        console.log(
          `${this.colors.fgCyan}${message}${this.colors.reset}`,
          typeof result.message === 'string'
            ? `${this.colors.fgGreen}${result.message}${this.colors.reset}`
            : result.message,
        );
      },
    };

    if (type === 'list' || type === 'list-multi') {
      // List
      const script = this.run2(
        [
          (() => {
            let fzfPreviews = [];
            let fzfChoices = choices.map((choice, index) => {
              if (choice[2] !== undefined) {
                fzfPreviews.push(choice[2]);
              } else {
                fzfPreviews.push('');
              }
              return `${index}|${choice[0]}`;
            });
            fzfPreviews = fzfPreviews.map((fzfPreview) => `'${fzfPreview}'`).join(' ');

            if (header !== '') {
              fzfChoices.unshift(`index|${header}`);
            }
            fzfChoices = fzfChoices.join('\n');
            return `previews () { data=(${fzfPreviews}); echo "$\{data[$1]}"; };export -f previews;echo '${fzfChoices}' | tr '|' '\t' | column -t -s $'\t' -o '\t'| fzf`;
          })(),
          `--prompt "${message} "`,
          (() => {
            if (header === '') {
              return '';
            }
            return '--header-lines=1';
          })(),
          `--query "${preset}"`,
          `--height=${height}`,
          '--tabstop=1',
          '--cycle',
          '--color=bg+:-1',
          '--info=inline',
          '--print-query',
          "-d '\t'",
          '--with-nth=2..',
          (() => {
            switch (preview.type) {
              case 'text':
                return "--preview='previews {1}'";
              case 'json':
                return "--preview='previews {1} | jq -C'";
              case 'markdown':
                return "--preview='previews {1} | bat --language=md --color=always --style=plain'";
              case 'html':
                return "--preview='previews {1} | w3m -T text/html'";
              default:
                return '';
            }
          })(),
          `--preview-window=${preview.style}:wrap`,
          '--marker="+"',
          `${type === 'list-multi' ? '-m' : ''}`,
        ].join(' '),
      );

      if (script.status === 0) {
        const returnValues = [];
        const returnTexts = [];
        const data = script.out.split('\n'); //  ['query', '8\tChoice1', '9\tChoice2']
        data.shift(); // ['8\tChoice1', '9\tChoice2']
        data.forEach((record) => {
          // record: '8\tChoice1'
          const index = record.split('\t')[0] * 1;
          const text = choices[index][0].split('|');
          if (preview.type !== '') {
            text.pop();
          }
          returnTexts.push(text.join('|'));
          returnValues.push(choices[index][1]);
        });

        // Αν είναι μία η τιμή να μην εμαφανίζονται τα []
        result.message = returnTexts.length !== 1 ? returnTexts : returnTexts[0];

        // Αν είναι πολλαπλή επιστρέφει array ακόμα και όταν έχει επιλεχτεί 1.
        result.data = type === 'list-multi' ? returnValues : returnValues[0];

        result.log();
        onAnswer(result.data);
        return result.data;
      }
      if (script.status === 1) {
        result.data = script.out.split('\n').shift();
        result.message = `${result.data} ${this.colors.fgRed}try again`;
        result.log();
        return this.fzf(db);
      }
      if (script.status === 130) {
        result.data = null;
        result.message = `${this.colors.fgRed}esc`;
        result.log();
        onAnswer(result.data);
        return result.data;
      }
    } else if (type === 'input') {
      // Input
      const script = this.run2(
        [
          (() => {
            if (choices.length > 0) {
              return `echo "-insert-\n${choices.join('\n')}" | fzf `;
            }
            return 'echo "" | fzf --pointer=" "';
          })(),
          (() => {
            if (header === '') {
              return '';
            }
            return `--header='${header}'`;
          })(),
          `--height=${height}`,
          '--color=bg+:-1',
          '--info=hidden',
          '--disabled',
          '--print-query',
          `--prompt "${message} "`,
          `--query "${preset}"`,
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
            // ? Υπάρχει πρόβλημα στο json αν εισάγουμε κείμενο με πολλαπλές σειρές
            result.data = convert(this.vim(data[0]));
            break;
          default:
            result.data = choices.length > 0 ? convert(data[1]) : convert(data[0]);
        }
        if (validation(result.data) === true && result.data !== '') {
          result.message = result.data;
          result.log();
          onAnswer(result.data);
          return result.data;
        }
        // validation είναι false ή ''
        result.message = `${result.data} ${this.colors.fgRed}try again`;
        result.log();
        return this.fzf(db);
      }
      if (script.status === 130) {
        result.data = null;
        result.message = `${this.colors.fgRed}esc`;
        result.log();
        onAnswer(result.data);
        return result.data;
      }
    }
    result.message = `${this.colors.fgRed}system error`;
    result.data = null;
    result.log();
    onAnswer(result.data);
    return process.exit(1);
    // Το consistent-return απαιτεί return.
    // Λειτουργεί και χωρίς return.
  },

  fzfPromise(db) {
    return new Promise((res, rej) => {
      const value = this.fzf(db);
      if (value !== null) {
        res(value);
      } else {
        rej(Error('It is null'));
      }
    });
  },

  fzfs(db) {
    // bulk of answers
    // Αν υπάρχει ένα null τα άλλα δεν εκτελούνται.
    let nullValue = false;
    db.forEach((question) => {
      let fzfQuestion;
      if (typeof question === 'function') {
        fzfQuestion = question();
      } else {
        fzfQuestion = question;
      }
      if (nullValue === false) {
        nullValue = this.fzf(fzfQuestion) === null;
      }
    });
  },
};

module.exports = sh;
