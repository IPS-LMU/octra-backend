import * as yargs from "yargs";
import {exec} from "child_process";
import * as fs from "fs";
import * as Path from "path";
import {version} from "../package.json";

const runScript = async (scriptPath, showOutput) => {
  return new Promise<void>((resolve, reject) => {
    const process = exec(scriptPath);
    if (showOutput) {
      console.log(`run ${scriptPath}`);
    }
    process.stdout.on('data', (data) => {
      if (showOutput) {
        console.log(data.toString());
      }
    });

    process.stderr.on('data', (data) => {
      reject(data.toString());
    });
    // what to do when the command is done
    process.on('exit', (code) => {
      resolve();
    });
  });
}

const nodeModulesPath = "/snapshot/octra-backend/node_modules/";
const basePath = "/snapshot/octra-backend/dist/apps/octra-cli/src/";
const typeORMPath = `node ${Path.join(nodeModulesPath, '.bin/typeorm')} --config ${Path.join(basePath, 'datasource.js')}`;
const argv = yargs
  .version(version)
  .command('install', "Installs a new Octra-DB on the given connection in config.json.", async (args) => {
    console.log("Remove all existing tables...")
    await runScript(`${typeORMPath} schema:drop`, false);
    console.log("Removed Database.");
    console.log("Initialize database...");
    await runScript(`${typeORMPath} migration:run`, true);
    console.log("Installation complete.");
  })
  .command('currDir', "Install a new Octra-DB.", (args) => {
    console.log(__dirname);
  })
  .command("ls -a [path]", "", (yargs) => {
    yargs.positional('path', {
      type: 'string',
      default: '',
      describe: 'List files'
    });
    console.log((yargs as any).argv);
    console.log(fs.readdirSync(Path.join((yargs.argv as any).path)));
  })
  .command("cmd [command]", "", async (yargs) => {
    yargs.positional('command', {
      type: 'string',
      default: '',
      describe: 'Run command'
    });
    await runScript((yargs.argv as any).command, undefined);
  })
  .help().alias('help', 'h').argv;


