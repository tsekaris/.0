const inquirer = require('inquirer');

inquirer
  .prompt([
    {
      type: 'input',
      choices: ['paok', 'aris', 'ole'],
      name: 'story',
      message: 'Tell me a story, a really long one!',
      validate(input) {
        if (input > 10) {
          return true;
        }
        return '> 10';
      },
    },
  ])
  .then((answers) => {
    console.info('Answer:', answers.story);
  });
