const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('.tmp/abb.db');

db.serialize(() => {
  db.each('SELECT name FROM devices', (err, row) => {
    console.log(`${row.name}`);
  });
  db.each('SELECT DISTINCT type FROM devices', (err, row) => {
    console.log(`${row.type}`);
  });
});

db.close();
