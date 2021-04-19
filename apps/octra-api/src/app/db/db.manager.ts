import {IDBConfiguration} from '../obj/app-config/app-config';
import {DatabaseRow} from '@octra/db';

export interface SQLQuery {
    text: string;
    values?: (string | number)[];
}

export interface QueryResult {
    rows: DatabaseRow[];
    rowCount: number;
}

export interface ParamterizedQuery {
    tableName: string;
    columns: {
        key: string;
        type: string;
        value: any;
    }[];
}

export abstract class DBManager {
    get connected(): boolean {
        return this._connected;
    }

    protected _connected: boolean;
    dbSettings: IDBConfiguration;

    abstract connect(): Promise<void>;

    abstract query(query: SQLQuery): Promise<QueryResult>

    abstract insert(query: ParamterizedQuery, idColumn: string): Promise<QueryResult>

    abstract update(query: ParamterizedQuery, where: string): Promise<QueryResult>

    abstract transaction(query: SQLQuery[]): Promise<any>;

    abstract createSQLQueryForInsert(query: ParamterizedQuery, idColumn: string): SQLQuery;

    abstract close(): Promise<void>;

    protected constructor(dbSettings: IDBConfiguration) {
        this.dbSettings = dbSettings;
    }
}
