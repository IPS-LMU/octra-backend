import {DBManager} from '../../../db/DBManager';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {randomBytes} from 'crypto';
import {AccountRow, AppTokensRow} from './database.types';
import {CreateProjectRequest} from './request.types';

export class DatabaseFunctions {
    private static dbManager: DBManager<any>;
    private static settings: AppConfiguration;

    private static selectAllStatements = {
        appTokens: 'select id::integer, name::text, key::text, domain::text, description::text from apptokens',
        account: 'select id::integer, username::text, email::text, loginmethod::text, active::boolean, hash::text, training::text, comment::text from account',
        project: 'select id::integer, name::text, shortname::text, description::text, configuration::text, startdate::text, enddate::text, active::boolean, admin_id::integer from project'
    };

    constructor() {
    }

    public static init(_dbManager: DBManager<any>, settings: AppConfiguration) {
        DatabaseFunctions.dbManager = _dbManager;
        DatabaseFunctions.settings = settings;
    }

    public static async isValidAppToken(token: string, originHost: string): Promise<void> {
        await DatabaseFunctions.dbManager.connect();
        const selectResult = await this.dbManager.query({
            text: DatabaseFunctions.selectAllStatements.appTokens + ' where key=$1::text',
            values: [token]
        });

        if (selectResult.rowCount === 1) {
            const resultRow = selectResult.rows[0] as AppTokensRow;
            if (resultRow.hasOwnProperty('domain') && resultRow.domain === originHost) {
                return;
            } else {
                throw 'Domain does not match the domain registered for this app key.';
            }
        }

        throw 'Could not find app token';
    }

    public static async createAppToken(data: {
        name: string,
        domain?: string,
        description?: string
    }): Promise<AppTokensRow[]> {
        try {
            await DatabaseFunctions.dbManager.connect();
            let token = await DatabaseFunctions.generateAppToken();

            const insertionResult = await this.dbManager.query({
                text: 'insert into apptokens(name, key, domain, description) values($1::text, $2::text, $3::text, $4::text) returning id',
                values: [data.name, token, data.domain, data.description]
            });

            if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
                const id = insertionResult.rows[0].id;
                const selectResult = await this.dbManager.query({
                    text: DatabaseFunctions.selectAllStatements.appTokens + ' where id=$1',
                    values: [id]
                });
                this.removePropertiesIfNull(selectResult.rows, ['domain', 'description']);

                return selectResult.rows as AppTokensRow[];
            }
            throw 'insertionResult does not have id';
        } catch (e) {
            console.log(`[Error]:`);
            console.log(e);
            throw 'could not generate and save app token';
        }
    }

    public static async createProject(data: CreateProjectRequest): Promise<AppTokensRow[]> {
        try {
            await DatabaseFunctions.dbManager.connect();

            const insertionResult = await this.dbManager.query({
                text: 'insert into project(name, shortname, description, configuration, startdate, enddate, active, admin_id) values($1::text, $2::text, $3::text, $4::text, $5::timestamp, $6::timestamp, $7::boolean, $8::integer) returning id',
                values: [
                    data.name, data.shortname, data.description, data.configuration, data.startdate,
                    data.enddate, 'true', data.admin_id
                ]
            });

            if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
                const id = insertionResult.rows[0].id;
                console.log(`added ${id}`);
                const selectResult = await this.dbManager.query({
                    text: DatabaseFunctions.selectAllStatements.project + ' where id=$1',
                    values: [id]
                });
                this.removePropertiesIfNull(selectResult.rows, ['shortname', 'description', 'configuration', 'startdate', 'enddate', 'admin_id']);
                console.log(selectResult.rows);
                return selectResult.rows as AppTokensRow[];
            }
            throw 'insertionResult does not have id';
        } catch (e) {
            console.log(`[Error]:`);
            console.log(e);
            throw 'Could not create and save a new project.';
        }
    }

    public static async removeAppToken(id: number): Promise<void> {
        await DatabaseFunctions.dbManager.connect();
        const removeResult = await this.dbManager.query({
            text: 'delete from apptokens where id=$1::numeric',
            values: [id]
        });
        if (removeResult.rowCount < 1) {
            throw 'could not remove app token';
        }
        return;
    }

    public static async listAppTokens(): Promise<AppTokensRow[]> {
        await DatabaseFunctions.dbManager.connect();
        const selectResult = await this.dbManager.query({
            text: DatabaseFunctions.selectAllStatements.appTokens
        });
        DatabaseFunctions.removePropertiesIfNull(selectResult.rows, ['description', 'domain']);
        return selectResult.rows as AppTokensRow[];
    }

    static async createUser(userData: {
        name?: string,
        email?: string,
        password: string
    }): Promise<AccountRow> {
        await DatabaseFunctions.dbManager.connect();
        const insertionResult = await this.dbManager.query({
            text: 'insert into account(username, email, hash) values($1::text, $2::text, $3::text) returning id',
            values: [userData.name, userData.email, userData.password]
        });

        if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
            const selectResult = await this.dbManager.query({
                text: this.selectAllStatements.account + ' where id=$1::numeric',
                values: [insertionResult.rows[0].id]
            });
            if (selectResult.rowCount === 1) {
                return selectResult.rows[0] as AccountRow;
            }
        }

        throw 'could not create user';
    }

    static async listUsers(): Promise<AccountRow[]> {
        await DatabaseFunctions.dbManager.connect();
        const selectResult = await this.dbManager.query({
            text: 'select id::integer, username::text, createdate::text, active::boolean, training::text, comment::text from account'
        });

        DatabaseFunctions.removePropertiesIfNull(selectResult.rows, ['comment', 'training']);

        return selectResult.rows as AccountRow[];
    }

    static async removeUserByID(id: number): Promise<void> {
        await DatabaseFunctions.dbManager.connect();
        const removeResult = await this.dbManager.query({
            text: 'delete from account where id=$1::numeric',
            values: [id]
        });
        if (removeResult.rowCount < 1) {
            throw `Could not remove user account.}.`;
        }
        return;
    }

    static async getUser(id: number): Promise<AccountRow> {
        await DatabaseFunctions.dbManager.connect();
        const selectResult = await this.dbManager.query({
            text: this.selectAllStatements.account + ' where id=$1::numeric',
            values: [id]
        });

        if (selectResult.rowCount === 1) {
            DatabaseFunctions.removePropertiesIfNull(selectResult.rows, ['comment', 'training']);
            return selectResult.rows[0] as AccountRow;
        }

        throw 'could not find user';
    }

    static async getUserInfoByUserName(name: string): Promise<{
        password: string,
        id: number
    }> {
        await DatabaseFunctions.dbManager.connect();
        const selectResult = await this.dbManager.query({
            text: 'select id::integer, email::text, hash::text from account where username=$1::text',
            values: [name]
        });

        const row = selectResult.rows[0] as AccountRow;
        if (selectResult.rowCount === 1) {
            return {
                password: row.hash,
                id: row.id
            };
        }

        throw 'could not find user';
    }

    static async generateAppToken(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            randomBytes(20, function (err, buffer) {
                if (err) {
                    reject(err);
                } else {
                    resolve(buffer.toString('hex'));
                }
            });
        });
    }

    static removePropertiesIfNull(rows: any[], attributes: string[]) {
        for (const row of rows) {
            for (const attribute of attributes) {
                if (row.hasOwnProperty(attribute) && row[attribute] === null) {
                    delete row[attribute];
                }
            }
        }

    }
}
