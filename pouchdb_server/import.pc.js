const fetch = require('node-fetch');
const fs = require('fs');
const PouchDB = require('pouchdb');

const link = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIltzx-zQxBvDdgkBaP8Jbl62hUheFKy0NnkswMyG4Pl1HFxJfr1LXD3uRitr06OqucT5_TG34Yqfr/pub?output=tsv';

async function parts() {
  try {
    const dbOld = new PouchDB('http://localhost:3000/parts');
    await dbOld.destroy(); // delete και ξαναδημιουργία
    const db = new PouchDB('http://localhost:3000/parts');
    const response = await fetch(link);
    const tsv = await response.text();
    // const lines = tsv.split(/(?:\r\n|\r|\n)/g);
    const lines = tsv.split('\n');
    let data = [];
    lines.forEach((line) => {
      data = [...data, ...JSON.parse(line)];
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
