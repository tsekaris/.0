async function selectAmper() {
  try {
    let sql = '';
    let sqlResult;
    let promptData; // Το έκανα για να πειραματίζομαι με inquirer και με το fzf

    promptData = {
      type: 'input',
      name: 'amper',
      message: 'Amper:',
    };

    const amper = fzf(promptData).value;
    // const { amper } = await prompt(promptData);

    sql = `select distinct type  from devices where aMin <= ${amper} and aMax >= ${amper}`;
    sqlResult = await database.all(sql);
    promptData = {
      type: 'list',
      name: 'type',
      message: 'Type:',
      choices: sqlResult.map((element) => element.type),
    };

    const type = fzf(promptData).value;
    // const { type } = await prompt(promptData);

    sql = `select distinct poles  from devices where type = '${type}' and aMin <= ${amper} and aMax >= ${amper}`;
    sqlResult = await database.all(sql);
    promptData = {
      type: 'list',
      name: 'poles',
      message: 'Poles:',
      choices: sqlResult.map((element) => element.poles),
    };

    const poles = fzf(promptData).value;
    // const { poles } = await prompt(promptData);

    sql = `select distinct kA from devices where type = '${type}' and poles = '${poles}' and aMin <= ${amper} and aMax >= ${amper}`;
    sqlResult = await database.all(sql);

    promptData = {
      type: 'list',
      name: 'kA',
      message: 'kA:',
      choices: sqlResult.map((element) => element.data.replace('[', '').replace(']', '')),
    };

    let data = fzf(promptData).value;
    data = data.split(',');
    data = JSON.stringify(data);
    // const { data } = await prompt(promptData);

    sql = `select id, name, price from devices where type = '${type}' and poles = '${poles}' and data = '${data}' and aMin <= ${amper} and aMax >= ${amper}`;
    sqlResult = await database.all(sql);
    promptData = {
      type: 'list',
      name: 'selection',
      message: 'Select:',
      choices: sqlResult.map((element) => `${element.id} ${element.name} ${element.price}€`),
    };

    const selection = fzf(promptData).value;
    // const { selection } = await prompt(promptData);
  } catch (error) {
    console.error(error);
  }
}
