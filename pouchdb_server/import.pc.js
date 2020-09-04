const fs = require('fs').promises;
const PouchDB = require('pouchdb');

async function loadJSON() {
  try {
    const dbOld = new PouchDB('http://localhost:3000/parts');
    await dbOld.destroy();
    const db = new PouchDB('http://localhost:3000/parts');
    const json = await fs.readFile(`${process.env.HOME}/.0/xlsx/.tmp/data.json`);
    const result = await db.bulkDocs(JSON.parse(json));
    result.forEach((item) => {
      if (!item.ok) {
        console.log(item.id);
      }
    });
    return result;
  } catch (err) {
    console.log(err);
  }
}

// loadJSON().then(console.log);
loadJSON();
