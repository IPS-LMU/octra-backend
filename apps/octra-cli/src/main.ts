import {version} from '../package.json'

const args = process.argv;

function getVersion() {
  console.log(`v${version}`)
}

const commands = [
  {
    command: '-v',
    hasArgument: false,
    options: [],
    description: 'Installs the OCTRA DB to the database named in the config.json',
    method: getVersion
  },
  {
    command: 'install',
    hasArgument: false,
    options: [],
    description: 'Installs the OCTRA DB to the database named in the config.json'
  }
]

for (let i = 2; i < args.length; i++) {
  const argument = args[i];
  switch (argument) {
    case('-v'):
      getVersion();
      break;
    default:
      throw new Error(`Unknown argument ${argument}`);
  }
}
