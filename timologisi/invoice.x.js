const sh = require('sh'); // δικιά μου βιβλιοθήκη
const marked = require('marked');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('.cache/db.json');
const database = low(adapter);

function calculate(invoice) {
  invoice.fpa.amount = (invoice.amount * invoice.fpa.percent) / 100;
  invoice.parakratisi.amount = (invoice.amount * invoice.parakratisi.percent) / 100;
  invoice.total = invoice.amount + invoice.fpa.amount;
}

function newInvoice(db) {
  const invoice = {};

  const lastInvoice = db
    .get('invoices')
    .maxBy((record) => record.id)
    .value();

  if (lastInvoice === undefined) {
    invoice.id = 1;
    invoice.date = {};
    const date = new Date();
    invoice.date.year = date.getFullYear();
  } else {
    invoice.id = lastInvoice.id + 1;
    invoice.date = {};
    invoice.date.year = lastInvoice.date.year;
  }

  const getDays = (year, month) => {
    const monthIndex = month - 1; // 0..11
    const names = ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή'];
    const date = new Date(year, monthIndex, 1);
    const result = [];
    while (date.getMonth() === monthIndex) {
      result.push(`${date.getDate()} ${names[date.getDay()]}`);
      date.setDate(date.getDate() + 1);
    }
    return result;
  };

  invoice.date.month = sh.fzf({
    message: 'Μήνας:',
    choices: [
      '1 Ιανουάριος',
      '2 Φεβρουάριος',
      '3 Μάρτιος',
      '4 Απρίλιος',
      '5 Μάιος',
      '6 Ιούνιος',
      '7 Ιούλιος',
      '8 Αύγουστος',
      '9 Σεπτέμβριος',
      '10 Οκτώβριος',
      '11 Νοέμβριος',
      '12 Δεκέμβριος',
    ],
  }).id * 1;
  invoice.date.day = sh.fzf({
    message: 'Μέρα:',
    choices: getDays(invoice.date.year, invoice.date.month),
  }).id * 1;

  invoice.from = db.get('contacts').find({ id: 'tsekaris' }).value();

  const customer = sh.fzf({
    message: 'Πελάτης:',
    choices: db
      .get('contacts')
      .filter((contact) => contact.id !== 'tsekaris')
      .map('id')
      .value(),
  }).value;

  invoice.to = db.get('contacts').find({ id: customer }).value();

  invoice.amount = sh.fzf({
    message: 'Ποσό τιμολόγησης (χωρίς ΦΠΑ):',
  }).value * 1;

  const answer = sh.fzf({
    message: 'ΦΠΑ: 24% - Παρακράτηση: 20%:',
    choices: ['ναι', 'όχι'],
  }).value;

  invoice.fpa = {};
  invoice.parakratisi = {};

  if (answer === 'όχι') {
    invoice.fpa.percent = sh.fzf({
      message: 'ΦΠΑ:',
    }).value * 1;
    invoice.parakratisi.percent = sh.fzf({
      message: 'Παρακράτηση:',
    }).value * 1;
  } else {
    invoice.fpa.percent = 24.0;
    invoice.parakratisi.percent = 20.0;
  }

  calculate(invoice);

  // invoice.fpa.amount = (invoice.amount * invoice.fpa.percent) / 100;
  // invoice.parakratisi.amount = (invoice.amount * invoice.parakratisi.percent) / 100;
  // invoice.total = invoice.amount + invoice.fpa.amount;

  invoice.description = sh.fzf({
    message: 'Περιγραφή εργασιών:',
  }).value;

  console.log('--------------------');
  console.log(invoice);
  console.log('--------------------');

  if (sh.fzf({ message: 'Αποθήκευση;', choices: ['ναι', 'όχι'] }).value === 'ναι') {
    db.get('invoices').push(invoice).write();
  }
}

function statistics(db) {
  const trimino1 = db.get('invoices').filter((record) => record.date.month <= 3);
  const trimino2 = db
    .get('invoices')
    .filter((record) => record.date.month > 3 && record.date.month <= 6);
  const trimino3 = db
    .get('invoices')
    .filter((record) => record.date.month > 6 && record.date.month <= 9);
  const trimino4 = db
    .get('invoices')
    .filter((record) => record.date.month > 9 && record.date.month <= 12);

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

  /*
  db.get('statistics')
    .set('trimino1', statistics.trimino1)
    .set('trimino2', statistics.trimino2)
    .set('trimino3', statistics.trimino3)
    .set('trimino4', statistics.trimino4)
    .set('all', statistics.all)
    .write();
   */
}

function editInvoice(db) {
  const choices = db
    .get('invoices')
    .map((invoice) => `${invoice.id} ${invoice.to.id} "${invoice.description}"`)
    .value();
  const invoiceId = sh.fzf({ message: 'Select:', choices }).id * 1;
  const invoice = db.get('invoices').find({ id: invoiceId }).value();
  const invoiceEdited = sh.vim(invoice);
  calculate(invoiceEdited);
  console.log('--------------------');
  console.log(invoiceEdited);
  console.log('--------------------');
  if (sh.fzf({ message: 'Αποθήκευση;', choices: ['ναι', 'όχι'] }).value === 'ναι') {
    db.get('invoices').find({ id: invoiceId }).assign(invoiceEdited).write();
  }
}

function markdown(db) {
  const choices = db
    .get('invoices')
    .map((invoice) => `${invoice.id} ${invoice.to.id} "${invoice.description}"`)
    .value();
  const invoiceId = sh.fzf({ message: 'Select:', choices }).id * 1;
  const invoice = db.get('invoices').find({ id: invoiceId }).value();
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
  const md = `
  ## Τιμολόγιο παροχής υπηρεσιών.
  
  ### Στοιχεία τιμολογίου.

  |   |   |
  |---|---|
  |Αριθμός|${invoice.id}|
  |Ημερομηνία|${invoice.date.day}/${invoice.date.month}/${invoice.date.year}|

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

  console.log(marked(md));
}

function menu() {
  switch (
    sh.fzf({
      message: 'Ενέργεια',
      choices: ['new invoice', 'edit invoice', 'markdown', 'statistics', 'exit'],
    }).value
  ) {
    case 'new invoice':
      newInvoice(database);
      menu();
      break;
    case 'edit invoice':
      editInvoice(database);
      menu();
      break;
    case 'markdown':
      markdown(database);
      menu();
    case 'statistics':
      statistics(database);
      menu();
      break;
    case 'exit':
      break;
    default:
      menu();
  }
}

menu();
