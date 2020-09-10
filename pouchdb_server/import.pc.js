const xlsx = require('xlsx');
const fetch = require('node-fetch');
const inquirer = require('inquirer');
const PouchDB = require('pouchdb');

const link = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQJSXIfxc37QtcXd_3Q4P7ZKHxExqj3A8g0Dh8n-q-aFrGlgCJAyPOAvFcTQvHpTpfndPnwKy-xUtrd/pub?output=xlsx';

async function parts() {
  try {
    const dbOld = new PouchDB('http://localhost:3000/parts');
    await dbOld.destroy(); // delete και ξαναδημιουργία
    const db = new PouchDB('http://localhost:3000/parts');
    const response = await fetch(link);
    const buffer = await response.buffer();
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const answer = await inquirer.prompt({
      type: 'checkbox',
      name: 'sheets',
      message: 'Select sheets:',
      choices: workbook.SheetNames,
    });
    let data = [];
    answer.sheets.forEach((sheetName) => {
      data = [...data, ...xlsx.utils.sheet_to_json(workbook.Sheets[sheetName])];
    });
    console.log(data.length);
    return await db.bulkDocs(data);
  } catch (err) {
    console.log(err);
  }
}

parts().then((result) => {
  result.forEach((item) => {
    if (!item.ok) {
      console.log(item.id);
    }
  });
});
