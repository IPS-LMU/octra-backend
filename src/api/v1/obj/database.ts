import {DBManager} from '../../../db/DBManager';
import * as bcrypt from 'bcryptjs';
import {AppConfiguration} from '../../../obj/app-config/app-config';

export class Database {
    private static dbManager: DBManager<any>;
    private static settings: AppConfiguration;

    constructor() {
    }

    public static init(_dbManager: DBManager<any>, settings: AppConfiguration) {
        Database.dbManager = _dbManager;
        Database.settings = settings;
    }

    public static async isValidAppToken(token: string): Promise<any[]> {
        await Database.dbManager.connect();
        const selectResult = await this.dbManager.query({
            text: 'select * from apptokens where key=$1::text',
            values: [token]
        });

        if (selectResult.rowCount === 1) {
            return selectResult.rows[0];
        }

        throw 'could not find app token';
    }

    public static async createAppToken(data: {
        name: string,
        domain?: string,
        description?: string
    }): Promise<any[]> {
        await Database.dbManager.connect();
        let token = await Database.generateAppToken();
        token = token.substring(0, 20);

        const insertionResult = await this.dbManager.query({
            text: 'insert into apptokens(name, key, domain, description) values($1::text, $2::text, $3::text, $4::text) returning id',
            values: [data.name, token, data.domain, data.description]
        });
        if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
            const selectResult = await this.dbManager.query({
                text: 'select * from apptokens where id=$1::numeric',
                values: [insertionResult.rows[0].id]
            });
            return selectResult.rows;
        }
        throw 'could not find added app token';
    }

    static async createUser(userData: {
        name: string,
        password: string
    }) {
        await Database.dbManager.connect();
        const insertionResult = await this.dbManager.query({
            text: 'insert into account(username, hash) values($1::text, $2::text) returning id',
            values: [userData.name, userData.password]
        });

        if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
            const selectResult = await this.dbManager.query({
                text: 'select * from account where id=$1::numeric',
                values: [insertionResult.rows[0].id]
            });
            if (selectResult.rowCount === 1) {
                return selectResult.rows[0];
            }
        }

        throw 'could not create user';
    }

    static async getUser(id: number) {
        await Database.dbManager.connect();
        const selectResult = await this.dbManager.query({
            text: 'select * from account where id=$1::numeric',
            values: [id]
        });

        if (selectResult.rowCount === 1) {
            return selectResult.rows[0];
        }

        throw 'could not find user';
    }

    static async generateAppToken() {
        return bcrypt.hash(Date.now() + this.settings.api.secret, 8);
    }
}
