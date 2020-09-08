const axios = require('axios');
const fs = require('fs');

// const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIltzx-zQxBvDdgkBaP8Jbl62hUheFKy0NnkswMyG4Pl1HFxJfr1LXD3uRitr06OqucT5_TG34Yqfr/pub?output=xlsx';
const url = 'https://drive.google.com/file/d/1jxSeFE0khQf9tIXMRW9XnkNyIeUzGvYg/view';

/*
axios({
  method: 'get',
  url,
  responseType: 'blob',
}).then((response) => {
  response.data.pipe(fs.createWriteStream('parts.xlsx'));
});
*/

const getXLS = () => axios
  .request({
    responseType: 'arraybuffer',
    url,
    method: 'get',
    headers: {
      'Content-Type': 'blob',
    },
  })
  .then((result) => {
    const outputFilename = 'parts.xlsx';
    fs.writeFileSync(outputFilename, result.data);
    return outputFilename;
  });

getXLS();
