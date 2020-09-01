const xlsx = require('xlsx');
const fetch = require('node-fetch');
const fsp = require('fs').promises;

(async () => {
  const link = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKbEMf86Olz7cmKpviIAyuvGNisEVH5QPCv3AVNe8N8p1jwmPSpmc0B-5r6eiCpB9PMWsR6lpZE1-2/pub?output=xlsx';
  const response = await fetch(link);
  const buffer = await response.buffer();
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetNames = workbook.SheetNames;
  const data = {};

  sheetNames.forEach((sheetName) => {
    data[sheetName] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  });
  await fsp.mkdir('.tmp', { recursive: true }); // Απαραίτητο το recursive στην περίπτωση που υπάρχει ο φάκελος
  await fsp.writeFile('.tmp/data.json', JSON.stringify(data, null, 2));

  console.dir(data);
})();
