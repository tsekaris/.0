const fetch = require('node-fetch');

const link = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIltzx-zQxBvDdgkBaP8Jbl62hUheFKy0NnkswMyG4Pl1HFxJfr1LXD3uRitr06OqucT5_TG34Yqfr/pub?output=tsv';
async function parts() {
  try {
    const response = await fetch(link);
    const tsv = await response.text();
    return tsv;
  } catch (err) {
    console.log(err);
  }
}

parts().then(console.log);
