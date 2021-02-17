const sh = require('sh'); // δικιά μου βιβλιοθήκη
// const marked = require('marked');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('.cache/db.json');
const database = low(adapter);
const invoicesDb = database.get('invoices');
const contactsDb = database.get('contacts');

function calculate(db) {
  const invoice = db;
  invoice.fpa.amount = (invoice.amount * invoice.fpa.percent) / 100;
  invoice.parakratisi.amount = (invoice.amount * invoice.parakratisi.percent) / 100;
  invoice.total = invoice.amount + invoice.fpa.amount;
}

function newInvoice() {
  const invoice = {};

  // #date
  const getDays = (year, month) => {
    const monthIndex = month - 1; // 0..11
    const names = ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή'];
    const date = new Date(year, monthIndex, 1);
    const result = [];
    while (date.getMonth() === monthIndex) {
      result.push([`${date.getDate()}|${names[date.getDay()]}`, date.getDate()]);
      date.setDate(date.getDate() + 1);
    }
    return result;
  };

  const today = new Date();

  sh.fzf([
    {
      type: 'list',
      message: 'Μήνας:',
      header: 'no|μήνας',
      choices: [
        ['1|Ιανουάριος', 1],
        ['2|Φεβρουάριος', 2],
        ['3|Μάρτιος', 3],
        ['4|Απρίλιος', 4],
        ['5|Μάιος', 5],
        ['6|Ιούνιος', 6],
        ['7|Ιούλιος', 7],
        ['8|Αύγουστος', 8],
        ['9|Σεπτέμβριος', 9],
        ['10|Οκτώβριος', 10],
        ['11|Νοέμβριος', 11],
        ['12|Δεκέμβριος', 12],
      ],
      preset: today.getMonth() + 1,
      end: (value) => {
        invoice.date = {};
        invoice.date.year = 2021;
        invoice.date.month = value;
      },
    },
    () => ({
      type: 'list',
      message: 'Μέρα:',
      header: 'no|ημέρα',
      choices: getDays(invoice.date.year, invoice.date.month),
      preset: today.getDate(),
      end: (value) => {
        invoice.date.day = value;
      },
    }),
    {
      type: 'input-number',
      message: 'Ώρα:',
      preset: today.getHours(),
      enter: (value) => {
        if (value >= 0 && value < 24) {
          return { value, text: '' };
        }
        return { value: '-retry-', text: 'Τιμή εκτός ορίων 0..23.' };
      },
      end: (value) => {
        invoice.date.hour = value;
      },
    },
    {
      type: 'input-number',
      message: 'Λεπτό:',
      preset: today.getMinutes(),
      enter: (value) => {
        if (value < 0 || value > 60) {
          return { value: '-retry-', text: 'Από 0 εώς 59.' };
        }
        function twoDigits(val) {
          return `0${val}`.slice(-2);
        }
        invoice.date.minute = value;
        invoice.id = twoDigits(invoice.date.month)
          + twoDigits(invoice.date.day)
          + twoDigits(invoice.date.hour)
          + twoDigits(invoice.date.minute);

        if (invoicesDb.find({ id: invoice.id }).value() !== undefined) {
          return {
            value: '-retry-',
            text: 'Υπάρχει τιμολόγιο με την ίδια ημερομηνία και ώρα.',
          };
        }
        return { value, text: '' };
      },
    },
    {
      type: 'list',
      message: 'Πελάτης:',
      header: 'id|name',
      choices: contactsDb
        .filter((contact) => contact.id !== 'tsekaris')
        .sortBy('id')
        .map((record) => [`${record.id}|${record.name}`, record, JSON.stringify(record)])
        .value(),
      preview: {
        type: 'json',
        style: 'down:50%',
      },
      height: '95%',
      end: (value) => {
        invoice.from = contactsDb.find({ id: 'tsekaris' }).value();
        invoice.to = value;
      },
    },
    {
      type: 'input-number',
      message: 'Ποσό τιμολόγησης (χωρίς ΦΠΑ):',
      enter: (value) => {
        if (value > 0) {
          return { value, text: '' };
        }
        return { value: '-retry-', text: 'Τιμή > 0.' };
      },
      end: (value) => {
        invoice.amount = value;
      },
    },
    {
      type: 'input-number',
      message: 'ΦΠΑ:',
      preset: 24,
      choices: [0, 24],
      enter: (value) => {
        if (value >= 0 && value <= 100) {
          return { value, text: '' };
        }
        return { value: '-retry-', text: 'Τιμή εκτός 0..100' };
      },
      end: (value) => {
        invoice.fpa = {};
        invoice.fpa.percent = value;
      },
    },
    {
      type: 'input-number',
      message: 'Παρακράτηση:',
      preset: 20,
      choices: [0, 20],
      enter: (value) => {
        if (value >= 0 && value <= 100) {
          return { value, text: '' };
        }
        return { value: '-retry-', text: 'Τιμή εκτός 0..100' };
      },
      end: (value) => {
        invoice.parakratisi = {};
        invoice.parakratisi.percent = value;
      },
    },
    {
      type: 'input',
      message: 'Περιγραφή εργασιών:',
      header: 'Μία γραμμή',
      choices: ['-vim-'],
      enter: (value) => {
        if (value !== '') {
          return { value, text: '' };
        }
        return { value: '-retry-', text: 'Όχι κενή τιμή' };
      },
      end: (value) => {
        invoice.description = value;
      },
    },
    {
      type: 'list',
      message: 'Αποθήκευση;',
      choices: [
        ['ναι', true],
        ['όχι', false],
      ],
      end: (value) => {
        if (value) {
          calculate(invoice);
          invoicesDb.push(invoice).write();
        }
      },
    },
  ]);
}

// #statistics
function stats() {
  const trimino1 = invoicesDb.filter((record) => record.date.month <= 3);
  const trimino2 = invoicesDb.filter((record) => record.date.month > 3 && record.date.month <= 6);
  const trimino3 = invoicesDb.filter((record) => record.date.month > 6 && record.date.month <= 9);
  const trimino4 = invoicesDb.filter((record) => record.date.month > 9 && record.date.month <= 12);
  const statistics = {};
  statistics.trimino1 = {};
  statistics.trimino2 = {};
  statistics.trimino3 = {};
  statistics.trimino4 = {};
  statistics.all = {};
  statistics.trimino1.amount = trimino1.sumBy('amount').value();
  statistics.trimino2.amount = trimino2.sumBy('amount').value();
  statistics.trimino3.amount = trimino3.sumBy('amount').value();
  statistics.trimino4.amount = trimino4.sumBy('amount').value();
  statistics.trimino1.fpa = trimino1.sumBy('fpa.amount').value();
  statistics.trimino2.fpa = trimino2.sumBy('fpa.amount').value();
  statistics.trimino3.fpa = trimino3.sumBy('fpa.amount').value();
  statistics.trimino4.fpa = trimino4.sumBy('fpa.amount').value();
  statistics.all.amount = statistics.trimino1.amount
    + statistics.trimino2.amount
    + statistics.trimino3.amount
    + statistics.trimino4.amount;
  statistics.all.fpa = statistics.trimino1.fpa
    + statistics.trimino2.fpa
    + statistics.trimino3.fpa
    + statistics.trimino4.fpa;
  console.log(statistics);
}

// #edit invoice
function editInvoice() {
  const answers = {};

  sh.fzf([
    {
      type: 'list',
      message: 'Select:',
      header: 'no|πελάτης',
      choices: invoicesDb
        .sortBy('id')
        .map((inv) => [`${inv.id}|${inv.to.id}`, inv, JSON.stringify(inv)])
        .value(),
      preview: {
        type: 'json',
        style: 'right:50%',
      },
      end: (value) => {
        answers.invoice = value;
      },
    },
    {
      type: 'list',
      message: 'Ενέργεια',
      choices: [
        ['edit', 'edit'],
        ['delete', 'delete'],
      ],
      end: (value) => {
        answers.action = value;
      },
    },
    () => {
      switch (answers.action) {
        case 'edit': {
          const invoiceEdited = sh.vim(answers.invoice);
          return {
            type: 'list',
            message: 'Αποθήκευση;',
            choices: [
              ['όχι', false],
              ['ναι', true],
            ],
            end: (answer) => {
              if (answer) {
                invoicesDb.find({ id: answers.invoice.id }).assign(invoiceEdited).write();
              }
            },
          };
        }
        case 'delete':
          return {
            type: 'list',
            message: 'Διαγραφή;',
            choices: [
              ['όχι', false],
              ['ναι', true],
            ],
            end: (answer) => {
              if (answer) {
                invoicesDb.remove({ id: answers.invoice.id }).write();
              }
            },
          };
        default:
          return null; // Βγάζει σφάλμα
      }
    },
  ]);
}

// #markdown
function markdown() {
  function md(invoice) {
    const keys = ['name', 'object', 'afm', 'doy', 'address', 'zip', 'phone', 'mail'];
    const from = {};
    const to = {};
    keys.forEach((key) => {
      if (invoice.from[key] !== undefined) {
        from[key] = invoice.from[key];
      } else {
        from[key] = '';
      }
      if (invoice.to[key] !== undefined) {
        to[key] = invoice.to[key];
      } else {
        to[key] = '';
      }
    });
    const text = `
## Τιμολόγιο παροχής υπηρεσιών.

### Στοιχεία τιμολογίου.

|   |   |
|---|---|
|Αριθμός|${invoice.id}|
|Ημερομηνία|${invoice.date.day}/${invoice.date.month}/${invoice.date.year}|

Αριθμός: ${invoice.id}
Ημερομηνία: ${invoice.date.day}/${invoice.date.month}/${invoice.date.year}

### Εμπλεκόμενοι.

|   |Από|Προς|
|---|---|---|
|Επωνυμία:|${from.name}|${to.name}|
|Επάγγελμα:|${from.object}|${to.object}|
|Α.Φ.Μ.:|${from.afm}|${to.afm}|
|Δ.Ο.Υ.:|${from.afm}|${to.afm}|
|Διεύθυνση:|${from.address}|${to.address}|
|Τ.Κ.:|${from.zip}|${to.zip}|
|Τηλέφωνο:|${from.phone}|${to.phone}|
|mail:|${from.mail}|${to.mail}|

### Τιμολόγηση.

|   |   |
|---|---|
|Σύνολο:|${invoice.amount}|
|Φ.Π.Α. (${invoice.fpa.percent}):|${invoice.fpa.amount}|
|Παρακράτηση (${invoice.parakratisi.percent}):|${invoice.parakratisi.amount}|
|Γενικό σύνολο:|${invoice.total}|

### Περιγραφή εργασιών.
${invoice.description}

### Ο εκδότης.
Τσέκαρης Μιχαήλ

### Ο παραλαβών.
  `;
    return text;
  }

  sh.fzf([
    {
      type: 'list',
      message: 'Επιλογή',
      header: 'no|πελάτης',
      choices: invoicesDb
        .sortBy('id')
        .map((invoice) => [`${invoice.id}|${invoice.to.id}`, invoice.id, md(invoice)])
        .value(),
      height: '70%',
      preview: {
        type: 'markdown',
        style: 'right:70%',
      },
    },
  ]);
}

// #testing

function testing() {}

function exit() {
  process.exit(1); // έξοδος από το πρόγραμμα
}

// #menu
function menu() {
  sh.fzf({
    type: 'list',
    message: 'Ενέργεια',
    header: 'search|ενέργεια',
    choices: [
      ['new invoice|Νέο τιμολόγιο.', newInvoice],
      ['edit invoice|Επεξεργασία αποθηκευμένου τιμολογίου.', editInvoice],
      ['markdown|Εκτύπωση.', markdown],
      ['statistics|Στατιστικά.', stats],
      ['testing|Για τεστάρισμα κώδικα.', testing],
      ['exit|Έξοδος από το πρόγραμμα.', exit],
    ],
    esc: () => ({
      value: '-exit-',
      text: 'Bye, bye.',
    }),
    enter: (value) => {
      if (value === exit) {
        return { value, text: 'Bye, bye.' };
      }
      return { value };
    },
    end: (action) => {
      action();
    },
  });
  menu();
}

menu();
