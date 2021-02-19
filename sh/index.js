const childProcess = require('child_process');
// const { resolve } = require('dns');
// const { basename } = require('path');
// const { rejects } = require('assert');

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
  red(text) {
    return `${sh.colors.fgRed}${text}${sh.colors.reset}`;
  },
  green(text) {
    return `${sh.colors.fgGreen}${text}${sh.colors.reset}`;
  },
  yellow(text) {
    return `${sh.colors.fgYellow}${text}${sh.colors.reset}`;
  },
  blue(text) {
    return `${sh.colors.fgBlue}${text}${sh.colors.reset}`;
  },
  magenta(text) {
    return `${sh.colors.fgMagenta}${text}${sh.colors.reset}`;
  },
  cyan(text) {
    return `${sh.colors.fgCyan}${text}${sh.colors.reset}`;
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
        return sh.run2(`echo '${data}' | vipe `).out;
      case 'object':
        return JSON.parse(
          sh.run2(`echo '${JSON.stringify(data, null, 2)}' | vipe --suffix json`).out,
        );
      default:
        return '';
    }
    // Χωρίς vipe
    // Απαραίτητα τα /dev/tty γιατί αλλιώς δεν εμφανίζει τίποτα στο vim
    // return sh.run(
    // `echo '${objJson}' > vim.json; vim vim.json < /dev/tty > /dev/tty`,
    // );
  },

  fzf(db) {
    // bash status:
    // 0: Normal exit
    // 1: No match (αν θέλω να το χρησιμοποιώ σαν input)
    // 2: Error
    // 130: ctr-c or esc pressed
    if (Array.isArray(db)) {
      // Η forEach δεν έχει break
      // Η every αν επιστρεψει false τότε λειτουργεί σαν break
      const answers = [];
      db.every((question) => {
        const answer = sh.fzf(question);
        if (answer !== '-esc-') {
          answers.push(answer);
          return true;
        }
        return false;
      });
      return answers;
    }
    if (typeof db === 'function') {
      return sh.fzf(db());
    }
    const {
      type = 'input', // list, list-multi, input, input-number
      message = 'Εισαγωγή τιμής:',
      details = '', // header του fzf
      header = '',
      preset = '', // Για το input κυρίως. Η default τιμή.  query για fzf.
      exact = false, // search αυστηρό όταν είναι true
      height = '50%',
      choices = [],
      preview = {
        type: '',
        style: 'right:0%', // :follow:wrap
      },
      enter = (value) => value,
      esc = () => '-esc-',
      end = () => {},
    } = db;

    function ret(value) {
      switch (value) {
        case '-retry-':
          return sh.fzf(db);
        case '-esc-':
          return '-esc-';
        case '-exit-':
          return process.exit(1);
        default:
          end(value);
          return value;
      }
    }

    switch (type) {
      case 'list':
      case 'list-multi': {
        const script = sh.run2(
          [
            (() => {
              let fzfPreviews = '';
              let fzfChoices = choices
                .map((choice, index) => {
                  // choice[0]: text
                  // choice[1]: return value
                  // choice[2]: preview
                  fzfPreviews = choice[2] !== undefined
                    ? `${fzfPreviews} '${choice[2]}'`
                    : `${fzfPreviews} 'no preview'`;
                  return `${index}|${choice[0]}`;
                })
                .join('\n');
              if (header !== '') {
                fzfChoices = `index|${header}\n${fzfChoices}`;
              }
              // Bash
              // previews (): function διαχείρισης των prviews.
              // tr: Αντικατάσταση των | με tabs.
              // column: Δημιουργία columns σύμφωνα με το μήκος.
              return `previews () { data=(${fzfPreviews}); echo "$\{data[$1]}"; };export -f previews;echo '${fzfChoices}' | tr '|' '\t' | column -t -s $'\t' -o '\t' | fzf`;
            })(),
            `--prompt "${message} "`, // Μήνυμα.
            `${details === '' ? '' : `--header='${details}'`}`,
            `${header === '' ? '' : '--header-lines=1'}`, // Ονόματα πεδίων.
            `--query "${preset}"`, // Προεπιλογή εισαγωγής.
            `--height=${height}`, // Ύψος
            `${exact ? '--exact' : ''}`,
            '--tabstop=1', // Το tab έχει μήκος 1 space.
            '--cycle', // Από το τέλος κατευθείαν στην αρχή.
            '--color=bg+:-1', // Χρώματα.
            '--info=inline', // Οι πληροφορίε της αναζήτησης σε μία γραμμή.
            '--print-query', // Επιστρέφει το κείμενο αναζήτησης.
            "-d '\t'", // Τα πεδία των επιλογών χωρισμένο με tabs.
            '--with-nth=2..', // Για να μην εμφανίζεται το index.
            '--no-mouse',
            (() => {
              // Preview
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
            `--preview-window=${preview.style}`, // Παράθυρο preview.
            '--marker="+"', // Σύμβολο πολλαπλής επιλογής.
            `${type === 'list-multi' ? '-m' : ''}`, // Πολλαπλή επιλογή.
          ].join(' '),
        );
        switch (script.status) {
          case 0: {
            // Υπάρχει επιλογή.
            let values = [];
            let texts = [];
            const data = script.out.split('\n'); //  ['query', '8\tChoice1', '9\tChoice2']
            data.shift(); // ['8\tChoice1', '9\tChoice2']
            data.forEach((record) => {
              // record: '8\tChoice1'
              const index = record.split('\t')[0] * 1;
              const text = choices[index][0];
              texts.push(text);
              values.push(choices[index][1]);
            });

            // Αν είναι μία η τιμή να μην εμαφανίζονται τα []
            texts = texts.length !== 1 ? texts : texts[0];

            // Αν είναι πολλαπλή επιστρέφει array ακόμα και όταν έχει επιλεχτεί 1.
            values = type === 'list-multi' ? values : values[0];
            console.log(sh.cyan(message), texts);
            return ret(enter(values));
          }
          case 1: {
            // Δεν υπάρχει επιλογή.
            console.log(sh.cyan(message), script.out.split('\n').shift());
            console.log(sh.red('Δεν υπάρχει επιλογή.'));
            return sh.fzf(db); // Ξανά η διαδικασία.
          }
          case 130: {
            // escaped.
            console.log(sh.cyan(message), sh.red('-esc-'));
            return ret(esc());
          }
          default:
            console.log(sh.cyan(message), sh.red('-error-'));
            return process.exit(1);
        }
      }
      case 'input':
      case 'input-number': {
        const script = sh.run2(
          [
            `${
              choices.length > 0
                ? `echo "-insert-\n${choices.join('\n')}" | fzf`
                : 'echo "" | fzf --pointer=" "'
            }`,
            `${details === '' ? '' : `--header='${details}'`}`,
            `--height=${height}`,
            '--color=bg+:-1',
            '--info=hidden',
            '--disabled', // Δεν υπάρχει search. Απλή επιλογή.
            '--print-query',
            `--prompt "${message} "`,
            `--query "${preset}"`,
            '--no-mouse',
          ].join(' '),
        );
        switch (script.status) {
          case 0:
          case 1: {
            const data = script.out.split('\n');
            const input = data[0]; // query
            const choice = data[1]; // menu
            let answer;
            switch (choice) {
              case '-insert-':
                answer = input;
                break;
              case '-vim-':
                answer = sh.vim(input);
                break;
              default:
                // αν υπάρχουν επιλογές επέστρεψε την επιλογή
                // αλλιώς επέστρεψε το text που εισάγεται
                answer = choices.length > 0 ? choice : input;
            }
            if (type === 'input-number') {
              answer = Number.isNaN(answer * 1) === false && answer !== '' ? answer * 1 : answer;
              if (typeof answer !== 'number') {
                console.log(sh.cyan(message), answer);
                console.log(sh.red('Δεν είναι αριθμός.'));
                return sh.fzf(db);
              }
            }
            console.log(sh.cyan(message), answer);
            return ret(enter(answer));
          }
          case 130: {
            // escaped.
            console.log(sh.cyan(message), sh.red('-esc-'));
            return ret(esc());
          }
          default:
            console.log(sh.cyan(message), sh.red('-error-'));
            return process.exit(1);
        }
      }
      default:
        console.log(sh.cyan(message), sh.red('-error-'));
        return process.exit(1);
    }
  },
};

module.exports = sh;
