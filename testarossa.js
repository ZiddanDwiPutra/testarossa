const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { program } = require('commander');
const { getContent } = require('./custom-content');

program
  .version('1.0.0')
  .description('Generate test files for .tsx files in the src directory')
  .option('-d, --directory <type>', 'source directory', 'src')
  .parse(process.argv);

const options = program.opts();
function toValidVariableName(name) {
    return name.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/-/g, '');
}
async function createTestFile(filePath) {
  const testFilePath = filePath.replace(/\.tsx$/, '.test.tsx');
  const timerLabel = `Created test file: ${testFilePath}`;
  console.time(chalk.green(timerLabel));
  if (await fs.pathExists(testFilePath)) {
    // console.log(chalk.yellow(`Test file already exists: ${testFilePath}`));
    return;
  }

  const componentName = toValidVariableName(path.basename(filePath, '.tsx').replace('.component', ''));
  const importPath = path.relative(path.dirname(testFilePath), filePath).replace(/\\/g, '/').replace(/^\.\.\//, './');

  const content = getContent(componentName, importPath) || `import { InitComponent } from "src/app/mocks/InitComponent"
import { render } from '@testing-library/react'
import {${componentName}} from './${importPath.replace('.tsx', '')}'

describe('${componentName}', () => {
  describe('render page', () => {
    const Component = (
      <InitComponent
        path={['/']}
        children={<${componentName} {...{} as any} />}
      />
    );

    test('${componentName} rendered', async () => {
      render(Component)
    })
  })
})`;

  await fs.outputFile(testFilePath, content);
  console.timeEnd(chalk.green(timerLabel));
}

async function findTsxFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
  
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
  
      if (entry.isDirectory()) {
        await findTsxFiles(fullPath);
      // } else if (entry.isFile() && fullPath.endsWith('Page.tsx') 
      } else if (entry.isFile() && !fullPath.endsWith('.test.tsx') && !fullPath.includes('-')) 
      {
        await createTestFile(fullPath);
      }
    }
  }

async function main() {
  try {
    const srcDir = path.resolve(options.directory);
    await findTsxFiles(srcDir);
    console.log(chalk.blue('Test file generation complete.'));
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
}

main();
