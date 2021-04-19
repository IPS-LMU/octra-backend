import {ApiCommand} from './api.command';

export enum RequestType {
    GET = 'GET',
    POST = 'POST',
    DELETE = 'DELETE'
}

export class ParentApiCommand extends ApiCommand {
    constructor(name: string) {
        super(name, '', RequestType.GET, '', false, []);
    }

    do(req, res): Promise<void> {
        return Promise.resolve(undefined);
    }
}

export interface APICommandGroup {
    parent?: ApiCommand,
    children: ApiCommand[]
}
