import {ApiCommand} from './api.command';
import {NextFunction, Response, Router} from 'express';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {verifyAppToken, verifyUserRole, verifyWebToken} from '../obj/middlewares';
import {InternRequest, TokenData} from '../obj/types';

export class CommandModule {
  get title(): string {
    return this._title;
  }

  get url(): string {
    return this._url;
  }

  get commands(): ApiCommand[] {
    return this._commands;
  }

  protected _commands: ApiCommand[] = [];
  private _url: string;
  private _title: string;

  constructor(url: string, title: string) {
    this._url = url;
    this._title = title;
  }

  init(v1Router: Router, environment: 'production' | 'development', settings: AppConfiguration) {
    const router = Router();

    // sorting commands is important for routing! Important!
    this._commands.sort((a, b) => {
      if (a.root === b.root) {
        if (a.url === b.url) {
          return 0;
        } else if (a.url.length > b.url.length) {
          return -1;
        }
        return 1;
      } else {
        return a.root.length - b.root.length;
      }
    });

    // initialize commands
    for (const command of this._commands) {
      command.init(settings);
    }

    const sameRoutes = this._commands.map(a => a.url).filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    for (const sameRoute of sameRoutes) {
      console.log(`activate router.use for ${this._url}${sameRoute}`);
      router.use(sameRoute, (req: InternRequest, res: Response, next: NextFunction) => {
        verifyAppToken(req, res, next, settings, () => {
          console.log(`verify app token ok`);
          const validCommand = this._commands.find(a => a.url === sameRoute && a.type === req.method);
          if (validCommand) {
            console.log(`test route ${validCommand.name}`);
            if (validCommand.needsJWTAuthentication) {
              console.log(`NEEDSJWT`);
              verifyWebToken(req, res, next, settings, validCommand, (tokenBody: TokenData) => {
                req.decoded = tokenBody;
                verifyUserRole(req, res, validCommand, () => {
                  // user may use this api method
                  console.log(`do after user res`);
                  console.log(tokenBody);
                  validCommand.do(req, res);
                });
              });
            } else {
              validCommand.do(req, res);
            }
          } else {
            next();
          }
        });
      });
    }

    v1Router.use(this._url, router);
  }
}
