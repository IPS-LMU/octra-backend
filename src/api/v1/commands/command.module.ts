import {ApiCommand, RequestType} from './api.command';
import {Router} from 'express';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {verifyUserRole, verifyWebToken} from '../obj/middlewares';
import {TokenData} from '../obj/request.types';

export class CommandModule {
    get commands(): ApiCommand[] {
        return this._commands;
    }

    protected _commands: ApiCommand[] = [];
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    init(v1Router: Router, environment: 'production' | 'development', settings: AppConfiguration) {
        const router = Router();

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
            }
        }

        v1Router.use(this.url, router);
    }
}
