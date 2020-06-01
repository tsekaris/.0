const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Database opened.');
  }
});

db.serialize(() => {
  db.run('CREATE TABLE teams (name TEXT, city TEXT)');
  const teams = [
    {
      $name: 'paok',
      $city: 'thessaloniki',
    },
    {
      $name: 'aris',
      $city: 'thessaloniki',
    },
    {
      $name: 'aek',
      $city: 'athens',
    },
    {
      $name: 'pao',
      $city: 'athens',
    },
    {
      $name: 'osfp',
      $city: 'peraus',
    },
  ];

  const stmt = db.prepare('INSERT INTO teams (city, name) VALUES ( $city, $name)');
  teams.forEach((team) => stmt.run(team));
  stmt.finalize();

  db.each('SELECT rowid AS id, name, city FROM teams', (err, row) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(`${row.id}: ${row.name}: ${row.city}`);
    }
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Database closed.');
  }
});
