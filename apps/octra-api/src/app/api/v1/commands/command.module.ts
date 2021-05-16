import {ApiCommand, RequestType} from './api.command';
import {Router} from 'express';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {verifyAppToken, verifyUserRole, verifyWebToken} from '../obj/middlewares';
import {TokenData} from '@octra/db';

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
        router.use((req, res, next) => {
            verifyAppToken(req, res, next, settings, () => {
              console.log(`verify app token next`);
                next();
            });
        });

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

        for (const command of this._commands) {
            command.init(settings);

            if (command.needsJWTAuthentication) {
                router.use(command.url, (req, res, next) => {
                    verifyWebToken(req, res, next, settings, (tokenBody: TokenData) => {
                        (req as any).decoded = tokenBody;
                        verifyUserRole(req, res, command, () => {
                            // user may use this api method
                            next();
                        });
                    });
                });
            }
            const route = router.route(command.url);
            const callback = (req, res) => {
                console.log(`called command ${command.name} (${command.type}): ${command.url}`);
                command.do(req, res);
            }

            switch (command.type) {
                case RequestType.GET:
                    route.get(callback);
                    break;
                case RequestType.POST:
                    route.post(callback);
                    break;
                case RequestType.PUT:
                    route.put(callback);
                    break;
                case RequestType.DELETE:
                    route.delete(callback);
                    break;
              default:
                console.error(`unrecognized type ${command.type}`);
            }
        }

        v1Router.use(this._url, router);
    }
}
