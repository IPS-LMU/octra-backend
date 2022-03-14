/***
 * This class contains a list of API commands and a call() method to use a command from list
 */
import {Express, Router} from 'express';
import * as bodyParser from 'body-parser';
import {SampleCommand} from './commands/sample.command';
import {APIV1Module} from './api.module';
import {AppConfiguration} from '../../obj/app-config/app-config';
import {DatabaseFunctions} from './obj/database.functions';
import {CommandModule} from './commands/command.module';
import {DBManager} from '../../db/db.manager';
import {ApiCommand} from './commands/api.command';
import {PathBuilder} from './path-builder';
import {Schema} from 'jsonschema';

export class APIV1 {
  get modules(): CommandModule[] {
    return this._modules;
  }

  get appPath(): string {
    return this._appPath;
  }

  public get information() {
    return {
      name: 'OCTRA',
      version: '0.3.1',
      apiSlug: 'v1'
    }
  }

  public get instance(): APIV1 {
    if (APIV1.instance === undefined) {
      return new APIV1();
    }
    return APIV1.instance;
  }

  private static instance: APIV1;

  private _modules: CommandModule[] = [];

  private _appPath: string;

  /***
   * initializes API
   * @param app Express server
   * @param environment 'production' or 'development'
   * @param settings
   * @param dbManager
   */
  public init(app: Express, environment: 'production' | 'development', settings: AppConfiguration, dbManager: DBManager, pathBuilder: PathBuilder) {
    console.log(`INIT V1`);
    DatabaseFunctions.init(dbManager, settings, pathBuilder);
    this._appPath = process.cwd();
    const v1Router = Router();

    v1Router.use(bodyParser.urlencoded({extended: false}));
    v1Router.use(bodyParser.json());

    this._modules = APIV1Module.modules;
    // register all commands
    for (let i = 0; i < this._modules.length; i++) {
      const module = this._modules[i];
      module.init(v1Router, environment, settings);
    }

    const commandsArray = APIV1Module.modules.map(a => a.commands.map((b) => {
      return {
        module: {
          title: a.title
        },
        ...b
      } as any
    })).reduce((acc, x) => {
      return acc.concat(x, []);
    }).map((a) => {
      return {
        ...a,
        _requestStructure: a._requestStructure,
        _responseStructure: a._responseStructure,
        _url: `/${this.information.apiSlug}${a._root}${a._url}`
      }
    });

    commandsArray.sort((a, b) => {
      if ((a as any)._name > (b as any)._name) {
        return 1;
      } else if ((a as any)._name < (b as any)._name) {
        return -1;
      }
      return 0;
    });

    const groupedCommands: {
      title: string;
      commands: ApiCommand[];
    }[] = [];

    for (const commandsArrayElement of commandsArray) {
      const groupIndex = groupedCommands.findIndex(a => a.title === commandsArrayElement.module.title);

      if (groupIndex < 0) {
        groupedCommands.push({
          title: commandsArrayElement.module.title,
          commands: [commandsArrayElement]
        });
      } else {
        groupedCommands[groupIndex].commands.push(commandsArrayElement);
      }
    }

    groupedCommands.sort((a, b) => {
      if ((a as any).title > (b as any).title) {
        return 1;
      } else if ((a as any).title < (b as any).title) {
        return -1;
      }
      return 0;
    });

    console.log(groupedCommands);
    v1Router.route(`/reference`).get((req, res) => {
      // const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      res.render(`api/${this.information.apiSlug}/index.ejs`, {
        commands: groupedCommands,
        printJSONTable: (json: Schema) => {
          return this.printJSONTable(json)
        },
        getHTTPMethodBadge: this.getHTTPMethodBadge,
        apiDefaultResponseSchema: new SampleCommand().defaultResponseSchema,
        apiInformation: this.information,
        appSettings: settings,
        url: settings.api.url
      });
    });

    app.use(`/${this.information.apiSlug}`, v1Router);
  }

  private printJSONTable(json: Schema) {
    let result = `
<table class="table table-sm table-bordered json-table">
  <thead class="thead-light">
  <tr>
  <th class="fit">JSON path</th>
  <th class="fit text-center">Required</th>
  <th class="fit text-center">Type</th>
  <th>Description</th>
  </tr>
  </thead>
  <tbody>{{row}}</tbody>
</table>`;

    const flatJSON = this.flattenJSON(json).filter(a => a.path !== undefined);
    flatJSON.sort((a, b) => {
      if (a.required === 'required' && b.required === '') {
        if (a.path > b.path) {
          return 1;
        }
        return -1;
      } else if (a.required === 'required' && b.required === 'required') {
        if (a.path > b.path) {
          return 1;
        }
        return 0;
      }
      return 1;
    });

    for (const jsonElement of flatJSON) {
      result = result.replace(`{{row}}`, `
<tr><td class="json-path fit">${jsonElement.path}</td><td class="json-required fit"><code>${jsonElement.required}</code></td><td class="json-type fit">${jsonElement.type}</td><td class="json-description">${jsonElement.description}</td></tr>
{{row}}`)
    }

    if (flatJSON.length === 0) {
      result = result.replace(`{{row}}`, `
<tr><td colspan="5" class="text-center">No params found.</td></tr>`)
    }

    result = result.replace('{{row}}', '');
    return result;
  }

  private flattenJSON = (json: Schema, path = '') => {
    let results = [];

    if (!json || Object.keys(json).length === 0) {
      return results;
    }

    if ((!json.properties && !json.items)) {
      // basis type
      results.push({
        path: path,
        type: json.type,
        required: json.required ? 'required' : '',
        description: json.description ?? ''
      });
      return results;
    }

    if (json.items) {
      // is array
      if (path === '') {
        results.push({
          path: `(parent)`,
          type: json.type,
          required: json.required ? 'required' : '',
          description: 'The payload is type of array.'
        });
      }
      if ((json.items as any).type !== 'object' && (json.items as any).type !== 'array') {
        path = [path].filter(a => a !== '').join('.');
      }
      results = results.concat(this.flattenJSON(json.items as Schema, path));
    } else {
      for (const jsonAttr of Object.keys(json.properties)) {
        const jsonElement = json.properties[jsonAttr];
        if (jsonElement) {
          const attr = (jsonElement.type === 'array') ? `[${jsonAttr}]` : jsonAttr;
          const currentPath = [path, attr].filter(a => a !== '').join('.');

          if (jsonElement.type === 'array') {
            results.push({
              path: currentPath,
              type: jsonElement.type ?? '',
              required: jsonElement.required ? 'required' : '',
              description: jsonElement.description ?? ''
            });
          }

          results = results.concat(this.flattenJSON(jsonElement, currentPath));
        }
      }
    }
    return results;
  };

  private getHTTPMethodBadge = (method: string, inNav = false) => {
    let className = '';
    const additionalClasses = inNav ? 'p-1 pl-2 pr-2 ml-1 text-sm nav-badge' : 'p-2';
    switch (method) {
      case ('GET'):
        className = 'bg-info text-light';
        break;

      case ('POST'):
        className = 'bg-dark text-light';
        break;

      case ('PUT'):
        className = 'bg-warning';
        break;

      case ('DELETE'):
        className = 'bg-danger text-light';
        break;
    }

    return `<span class="badge rounded-pill ${className} ${additionalClasses}" style="text-decoration: none; text-underline: none;">${method.toUpperCase()}</span>`
  }
}
