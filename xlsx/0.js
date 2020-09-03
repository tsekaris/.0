const xlsx = require('xlsx');
const fetch = require('node-fetch');
const fsp = require('fs').promises;
const inquirer = require('inquirer');

(async () => {
  const link = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIltzx-zQxBvDdgkBaP8Jbl62hUheFKy0NnkswMyG4Pl1HFxJfr1LXD3uRitr06OqucT5_TG34Yqfr/pub?output=xlsx';
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
  await fsp.mkdir('.tmp', { recursive: true }); // Απαραίτητο το recursive στην περίπτωση που υπάρχει ο φάκελος
  await fsp.writeFile('.tmp/data.json', JSON.stringify(data, null, 2));
  return data;
})().then((data) => {
  console.log(data.length);
});
