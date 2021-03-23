import {IDBConfiguration} from '../obj/app-config/app-config';
import {DatabaseRow} from '../api/v1/obj/database.types';

export interface SQLQuery {
    text: string;
    values?: (string | number)[];
}

export interface QueryResult {
    rows: DatabaseRow[];
    rowCount: number;
}

export abstract class DBManager<T> {
    get connected(): boolean {
        return this._connected;
    }

    protected client: T;
    protected _connected: boolean;
    dbSettings: IDBConfiguration;

    abstract connect(): Promise<void>;

    abstract query(query: SQLQuery): Promise<QueryResult>

    abstract transaction(query: SQLQuery[]): Promise<QueryResult>;

    abstract close(): Promise<void>;

    protected constructor(dbSettings: IDBConfiguration) {
        this.dbSettings = dbSettings;
    }
}
