const fetch = require('node-fetch');
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

let db = new PouchDB('http://localhost:3000/parts');

async function parts() {
  // Δεδομένα από google sheets.
  // File -> Publish to the web
  // Δεν χρειάζεται shared.
  const id = '13_HE3uL66MY-mu_dwQHKcY6Hyq2k5lRdVmTIFXt02GA';
  const sheet = 1;
  try {
    const response = await fetch(
      `https://spreadsheets.google.com/feeds/cells/${id}/${sheet}/public/full?alt=json`,
    );
    const googleData = await response.json();
    let data = [];
    const dataTotals = {};
    googleData.feed.entry.forEach((item) => {
      const groupData = JSON.parse(item.content.$t);
      dataTotals[groupData[0].type] = groupData.length;
      data = [...data, ...groupData];
    });
    // Delete and create:
    await db.destroy();
    db = new PouchDB('http://localhost:3000/parts');
    // Εισαγωγή docs
    const docsResult = await db.bulkDocs(data);
    const docsOk = [];
    const docsNoOk = [];
    docsResult.forEach((item) => {
      if (item.ok) {
        docsOk.push(item);
      } else {
        docsNoOk.push(item);
      }
    });
    // Δημιουργία index.
    const indexResult = await db.createIndex({
      index: {
        fields: ['brand', 'type', 'p', 'a.max'],
        name: 'abb',
        ddoc: 'indexes',
      },
    });
    return {
      data,
      dataTotals,
      docsNoOk,
      docsOk,
      indexResult,
    };
  } catch (err) {
    console.log(err);
  }
}
parts().then(console.log);
