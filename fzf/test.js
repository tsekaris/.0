const fzf = require(`${process.env.HOME}/.0/fzf/module`);

const choices = [
  'pe',
  'n',
  'r',
  's',
  't',
  'r 120vac',
  's 120vac',
  't 120vac',
  '230vac',
  '0/230vac',
  '24vac',
  '0/24vac',
  '24vdc',
  '0/24vdc',
  '12vdc',
  '0/12vdc',
  '5vdc',
  '0/5vdc',
  'di 230vac',
  'di 0vac',
  'di 24vac',
  'di 0/24vac',
  'di 24vdc',
  'di 0/24vdc',
  'di 12vdc',
  'di 0/12vdc',
  'di 5vdc',
  'di 0/5vdc',
  'do 24vdc',
  'do 0vdc',
  'do 12vdc',
  'do 0/12vdc',
  'do 5vdc',
  'do 0/5vdc',
  'rly 230vac',
  'rly 0/230vac',
  'rly 24vac',
  'rly 0/24vac',
  'rly 24vdc',
  'rly 0vdc',
  'rly 12vdc',
  'rly 0/12vdc',
  'rly 5vdc',
  'rly 0/5vdc',
  'ai 0...20ma',
  'ai 0...10vdc',
  'ai 0...5vdc',
  'ao 0...20ma',
  'ao 0...10vdc',
  'ao 0...5vdc',
  'rtd m+',
  'rtd i+',
  'rtd m-',
  'rtd i-',
];

console.log(fzf.run({ message: 'Are you paok ?', choices }));
