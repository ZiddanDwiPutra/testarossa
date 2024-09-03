const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { program } = require('commander');
const { getContent } = require('./custom-content');
const { Config } = require('./config');

let counter = 0;
program
  .version('1.0.0')
  .description('Generate test files for .tsx files in the src directory')
  .option('-d, --directory <type>', 'source directory', Config.default.targetFolder)
  .option('-ef, --endfix <type>', 'change endfix scanner', Config.default.endfix)
  .parse(process.argv);

const options = program.opts();
function getOptionsValue(option, defaultValue) {
  if(options[option]) return options[option];
  else return defaultValue;
}
function toValidVariableName(name) {
  return name.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/-/g, '');
}
async function readFile(filePath) {
  let isExportDef = true;
  try{
    await fs.readFile(filePath, "utf8", (err, data) => {
      if (!err) isExportDef = data.includes('export default');
    })
  }catch(e) {}

  return {isExportDef}
}

async function createTestFile(filePath) {
  const testFilePath = filePath.replace(Config.default.componentFileExt, Config.default.testFileExt);
  const timerLabel = `Created test file: ${testFilePath}`;
  console.time(chalk.green(timerLabel));
  const dataRead = await readFile(filePath);
  
  if (await fs.pathExists(testFilePath)) return;
  
  const componentName = toValidVariableName(path.basename(filePath, Config.default.componentFileExt).replace('.component', ''));
  const importPath = path.relative(path.dirname(testFilePath), filePath).replace(/\\/g, '/').replace(/^\.\.\//, './');
  
  //read export def
  let textImportComp =  `import {${componentName}} from './${importPath.replace(Config.default.componentFileExt, '')}'`;
  if (dataRead.isExportDef) textImportComp = `import ${componentName} from './${importPath.replace(Config.default.componentFileExt, '')}'`;

  let content = getContent(componentName, importPath, dataRead) || `import { InitComponent } from "src/app/mocks/InitComponent"
import { render } from '@testing-library/react'
${textImportComp}

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
  counter++;
}

async function findTsxFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const endfix = getOptionsValue('endfix', Config.default.endfix)
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const name = toValidVariableName(path.basename(fullPath, Config.default.componentFileExt).replace('.component', ''));
      
      if (entry.isDirectory()) {
        await findTsxFiles(fullPath);
      } else if (entry.isFile() && !fullPath.endsWith(Config.default.testFileExt) && !name.includes('-') && fullPath.endsWith(endfix)) 
      {
        await createTestFile(fullPath);
      }
    }
  }

async function main() {
  try {
    const srcDir = path.resolve(options.directory);
    await findTsxFiles(srcDir);
    console.log('---------end-----------')
    if(counter === 0) {
      console.log(chalk.yellowBright('There is no file for generate'), chalk.yellow('on', srcDir));
      console.log(chalk.blue('please check the endfix file or target folder, run --help for another options.'))
    }else console.log(chalk.blue('Test file generation complete.'), chalk.yellow('on', srcDir));
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
}

main();
