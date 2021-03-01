const inquirer = require('inquirer');

inquirer
  .prompt([
    {
      type: 'list',
      choices: ['paok', 'aris', 'ole'],
      name: 'story1',
      message: 'Tell me a story, a really long one!',
    },
    {
      type: 'list',
      choices: ['paok', 'aris', 'ole'],
      name: 'story2',
      message: 'Tell me a story, a really long one!',
    },
    {
      type: 'list',
      choices: ['paok', 'aris', 'ole'],
      name: 'story3',
      message: 'Tell me a story, a really long one!',
    },
    {
      type: 'list',
      choices: ['paok', 'aris', 'ole'],
      name: 'story4',
      message: 'Tell me a story, a really long one!',
    },
    {
      type: 'list',
      choices: ['paok', 'aris', 'ole'],
      name: 'story5',
      message: 'Tell me a story, a really long one!',
    },
    {
      type: 'list',
      choices: ['paok', 'aris', 'ole'],
      name: 'story6',
      message: 'Tell me a story, a really long one!',
    },
    {
      type: 'list',
      choices: ['paok', 'aris', 'ole'],
      name: 'story7',
      message: 'Tell me a story, a really long one!',
    },
    {
      type: 'list',
      choices: [
        'paok',
        'aris',
        'ole',
        'paok',
        'aris',
        'ole',
        'paok',
        'aris',
        'ole',
        'paok',
        'aris',
        'ole',
        'paok',
        'aris',
        'ole',
        'paok',
        'aris',
        'ole',
        'paok',
        'aris',
        'ole',
        'paok',
        'aris',
        'ole',
        'paok',
        'aris',
        'ole',
        'paok',
        'aris',
        'ole',
      ],
      name: 'story8',
      message: 'Tell me a story, a really long one!',
    },
    {
      type: 'list',
      choices: ['paok', 'aris', 'ole'],
      name: 'story9',
      message: 'Tell me a story, a really long one!',
    },
    {
      type: 'list',
      choices: ['paok', 'aris', 'ole'],
      name: 'story10',
      message: 'Tell me a story, a really long one!',
    },
  ])
  .then((answers) => {
    console.info('Answer:', answers);
  });
