#! /usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

const program = new Command();

program
  .version('1.0.0')
  .description('My CLI Tool');

program
  .command('generate <type> <name>')
  .alias('g')
  .description('Generate a new component')
  .action((type, name) => {
    if (type === 'component') {
      generateComponent(name);
    } else {
      console.log(chalk.red(`Unknown type: ${type}`));
    }
  });

program.parse(process.argv);

function generateComponent(name) {
  const componentDir = path.join(process.cwd(), name);
  const componentFile = path.join(componentDir, `${name}.component.js`);

  if (fs.existsSync(componentDir)) {
    console.log(chalk.red(`Component directory ${componentDir} already exists`));
    return;
  }

  fs.ensureDirSync(componentDir);

  const componentTemplate = `import React from 'react';

const ${name} = () => {
  return (
    <div>
      <h1>${name} Component</h1>
    </div>
  );
};

export default ${name};
`;

  fs.writeFileSync(componentFile, componentTemplate);

  console.log(chalk.green(`Component ${name} created successfully!`));
}
