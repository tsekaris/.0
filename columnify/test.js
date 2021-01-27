const columnify = require('columnify');

const columns = columnify(
  [
    {
      name: 'mod1 test test test',
      version: '0.0.1',
      preview: JSON.stringify({ name: 'tsekari', address: 'gravias 32' }),
    },
    {
      name: 'module2',
      version: '0.2.0',
    },
  ],
  {
    columnSplitter: ' | ',
  },
);

console.log(columns);
