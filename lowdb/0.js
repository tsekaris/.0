const sh = require('sh'); // δικιά μου βιβλιοθήκη
const fetch = require('node-fetch');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('.cache/db.json');
const db = low(adapter);

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
    const dataGoogleFormat = await response.json();
    const data = {
      parts: [],
      totals: {},
    };
    dataGoogleFormat.feed.entry.forEach((item) => {
      const groupData = JSON.parse(item.content.$t);
      data.totals[groupData[0].type] = groupData.length;
      data.parts = [...data.parts, ...groupData];
    });
    db.setState({ parts: data.parts }).write();
    const types = [
      ...new Set(
        db
          .get('parts')
          .sortBy('_id')
          .map((r) => r.type)
          .value(),
      ),
    ];
    const answers = {};

    sh.fzf([
      {
        type: 'list',
        message: 'Select type:',
        choices: types.map((t) => [t, t]),
        enter: (value) => {
          answers.type = value;
        },
      },
      () => ({
        type: 'list-multi',
        message: 'Select part:',
        choices: db
          .get('parts')
          .filter({ type: answers.type })
          .sortBy('_id')
          .map((record) => [`${record._id}`, record, sh.log(record)])
          .value(),
        enter: (value) => {
          console.log(value);
        },
      }),
    ]);
    return data;
  } catch (err) {
    console.log(err);
  }
  return null;
}
// parts().then(console.log);
parts();
