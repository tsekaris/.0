const fetch = require('node-fetch');
const fs = require('fs');

const link = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIltzx-zQxBvDdgkBaP8Jbl62hUheFKy0NnkswMyG4Pl1HFxJfr1LXD3uRitr06OqucT5_TG34Yqfr/pub?output=tsv';
async function parts() {
  try {
    const response = await fetch(link);
    const tsv = await response.text();
    // const lines = tsv.split(/(?:\r\n|\r|\n)/g);
    const lines = tsv.split('\n');
    let data = [];
    lines.forEach((line) => (data = [...data, ...JSON.parse(line)]));
    fs.writeFileSync('parts.json', JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.log(err);
  }
}

parts().then(console.log);
