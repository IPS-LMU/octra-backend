import {IDBConfiguration} from '../obj/app-config/app-config';

export interface SQLQuery {
    text: string;
    variables?: (string | number)[];
}

export abstract class DBManager<T, R> {
    get connected(): boolean {
        return this._connected;
    }

    protected client: T;
    protected _connected: boolean;
    dbSettings: IDBConfiguration;

    abstract connect(): Promise<void>;

    abstract query(query: SQLQuery): Promise<R>
    abstract transaction(query: SQLQuery[]): Promise<R>;

    abstract close(): Promise<void>;

    protected constructor(dbSettings: IDBConfiguration) {
        this.dbSettings = dbSettings;
    }
}
