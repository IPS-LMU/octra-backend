import {DBManager, SQLQuery} from '../../../db/DBManager';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {randomBytes} from 'crypto';
import {
    AccountRow,
    AppTokensRow,
    DatabaseRow,
    MediaItemRow,
    ProjectRow,
    RolesRow,
    ToolRow,
    TranscriptRow,
    UserRole
} from './database.types';
import {
    AddMediaItemRequest,
    AddToolRequest,
    AddTranscriptRequest,
    AssignUserRoleRequest,
    CreateProjectRequest,
    DeliverNewMediaRequest
} from './request.types';

export class DatabaseFunctions {
    private static dbManager: DBManager<any>;
    private static settings: AppConfiguration;

    private static selectAllStatements = {
        appTokens: 'select id::integer, name::text, key::text, domain::text, description::text from apptokens',
        account: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp from account ac',
        project: 'select id::integer, name::text, shortname::text, description::text, configuration::text, startdate::timestamp, enddate::timestamp, active::boolean, admin_id::integer from project',
        mediaitem: 'select id::integer, url::text, type::text, size::integer, metadata::text from mediaitem',
        tool: 'select id::integer, name::text, version::text, description::text, pid::text from tool',
        transcript: 'select id::integer, pid::text, orgtext::text, transcript::text, assessment::text, priority::integer, status::text, code::text, creationdate::timestamp, startdate::timestamp, enddate::timestamp, log::text, comment::text, tool_id::integer, transcriber_id::integer, project_id::integer, mediaitem_id::integer, nexttranscription_id::integer from transcript'
    };

    constructor() {
    }

    public static init(_dbManager: DBManager<any>, settings: AppConfiguration) {
        DatabaseFunctions.dbManager = _dbManager;
        DatabaseFunctions.settings = settings;
    }

    public static async isValidAppToken(token: string, originHost: string): Promise<void> {
        await DatabaseFunctions.dbManager.connect();
        const selectResult = await DatabaseFunctions.dbManager.query({
            text: DatabaseFunctions.selectAllStatements.appTokens + ' where key=$1::text',
            values: [token]
        });

        if (selectResult.rowCount === 1) {
            const resultRow = selectResult.rows[0] as AppTokensRow;
            if (resultRow.hasOwnProperty('domain') &&
                (!resultRow.domain || resultRow.domain === '' || resultRow.domain === originHost)
            ) {
                return;
            } else if (resultRow.hasOwnProperty('domain')) {
                throw 'Domain does not match the domain registered for this app key.';
            }
            return;
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

            const insertQuery = {
                tableName: 'apptokens',
                columns: [
                    DatabaseFunctions.getColumnDefinition('name', 'text', data.name, false),
                    DatabaseFunctions.getColumnDefinition('key', 'text', token, false),
                    DatabaseFunctions.getColumnDefinition('domain', 'text', data.domain),
                    DatabaseFunctions.getColumnDefinition('description', 'text', data.description)
                ]
            };
            const insertionResult = await DatabaseFunctions.dbManager.insert(insertQuery, 'id');

            if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
                const id = insertionResult.rows[0].id;
                const selectResult = await DatabaseFunctions.dbManager.query({
                    text: DatabaseFunctions.selectAllStatements.appTokens + ' where id=$1',
                    values: [id]
                });

                this.removePropertiesIfNull(selectResult.rows,
                    insertQuery.columns.filter(a => a.maybeNull).map(a => a.key)
                );
                this.convertColumnsToDatetimeString(selectResult.rows);

                return selectResult.rows as AppTokensRow[];
            }
            throw 'insertionResult does not have id';
        } catch (e) {
            console.log(`[Error]:`);
            console.log(e);
            throw 'could not generate and save app token';
        }
    }

    public static async createProject(data: CreateProjectRequest): Promise<ProjectRow[]> {
        try {
            await DatabaseFunctions.dbManager.connect();

            const insertQuery = {
                tableName: 'project',
                columns: [
                    DatabaseFunctions.getColumnDefinition('name', 'text', data.name, false),
                    DatabaseFunctions.getColumnDefinition('shortname', 'text', data.shortname),
                    DatabaseFunctions.getColumnDefinition('description', 'text', data.description),
                    DatabaseFunctions.getColumnDefinition('configuration', 'text', data.configuration),
                    DatabaseFunctions.getColumnDefinition('startdate', 'timestamp', data.startdate),
                    DatabaseFunctions.getColumnDefinition('enddate', 'timestamp', data.enddate),
                    DatabaseFunctions.getColumnDefinition('active', 'boolean', data.active),
                    DatabaseFunctions.getColumnDefinition('admin_id', 'integer', data.admin_id)
                ]
            };
            const insertionResult = await DatabaseFunctions.dbManager.insert(insertQuery, 'id');

            if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
                const id = insertionResult.rows[0].id;
                const selectResult = await DatabaseFunctions.dbManager.query({
                    text: DatabaseFunctions.selectAllStatements.project + ' where id=$1',
                    values: [id]
                });
                this.removePropertiesIfNull(selectResult.rows,
                    insertQuery.columns.filter(a => a.maybeNull).map(a => a.key)
                );
                this.convertColumnsToDatetimeString(selectResult.rows);
                return selectResult.rows as ProjectRow[];
            }
            throw 'insertionResult does not have id';
        } catch (e) {
            console.log(`[Error]:`);
            console.log(e);
            throw 'Could not create and save a new project.';
        }
    }

    public static async addMediaItem(data: AddMediaItemRequest): Promise<MediaItemRow[]> {
        try {
            await DatabaseFunctions.dbManager.connect();

            const insertQuery = {
                tableName: 'mediaitem',
                columns: [
                    DatabaseFunctions.getColumnDefinition('url', 'text', data.url, false),
                    DatabaseFunctions.getColumnDefinition('type', 'text', data.type),
                    DatabaseFunctions.getColumnDefinition('size', 'integer', data.size),
                    DatabaseFunctions.getColumnDefinition('metadata', 'text', data.metadata)
                ]
            };

            const insertionResult = await DatabaseFunctions.dbManager.insert(insertQuery, 'id');

            if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
                const id = insertionResult.rows[0].id;
                const selectResult = await DatabaseFunctions.dbManager.query({
                    text: DatabaseFunctions.selectAllStatements.mediaitem + ' where id=$1',
                    values: [id]
                });
                this.removePropertiesIfNull(selectResult.rows,
                    insertQuery.columns.filter(a => a.maybeNull).map(a => a.key)
                );
                this.convertColumnsToDatetimeString(selectResult.rows);
                return selectResult.rows as MediaItemRow[];
            }
            throw 'insertionResult does not have id';
        } catch (e) {
            console.log(`[Error]:`);
            console.log(e);
            throw 'Could not save a new media item.';
        }
    }

    public static async addTool(data: AddToolRequest): Promise<ToolRow[]> {
        try {
            await DatabaseFunctions.dbManager.connect();
            const insertQuery = {
                tableName: 'tool',
                columns: [
                    DatabaseFunctions.getColumnDefinition('name', 'text', data.name, false),
                    DatabaseFunctions.getColumnDefinition('version', 'text', data.version),
                    DatabaseFunctions.getColumnDefinition('description', 'text', data.description),
                    DatabaseFunctions.getColumnDefinition('pid', 'text', data.description)
                ]
            };
            const insertionResult = await DatabaseFunctions.dbManager.insert(insertQuery, 'id');

            if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
                const id = insertionResult.rows[0].id;
                const selectResult = await DatabaseFunctions.dbManager.query({
                    text: DatabaseFunctions.selectAllStatements.tool + ' where id=$1',
                    values: [id]
                });
                this.removePropertiesIfNull(selectResult.rows,
                    insertQuery.columns.filter(a => a.maybeNull).map(a => a.key)
                );
                this.convertColumnsToDatetimeString(selectResult.rows);
                return selectResult.rows as ToolRow[];
            }
            throw 'insertionResult does not have id';
        } catch (e) {
            console.log(`[Error]:`);
            console.log(e);
            throw 'Could not save a new tool.';
        }
    }

    public static async addTranscript(data: AddTranscriptRequest): Promise<TranscriptRow[]> {
        try {
            await DatabaseFunctions.dbManager.connect();

            const insertQuery = {
                tableName: 'transcript',
                columns: [
                    DatabaseFunctions.getColumnDefinition('pid', 'text', data.pid),
                    DatabaseFunctions.getColumnDefinition('orgtext', 'text', data.orgtext),
                    DatabaseFunctions.getColumnDefinition('transcript', 'text', data.transcript),
                    DatabaseFunctions.getColumnDefinition('assessment', 'text', data.assessment),
                    DatabaseFunctions.getColumnDefinition('priority', 'integer', data.priority),
                    DatabaseFunctions.getColumnDefinition('status', 'text', data.status),
                    DatabaseFunctions.getColumnDefinition('code', 'text', data.code),
                    DatabaseFunctions.getColumnDefinition('creationdate', 'timestamp', data.creationdate),
                    DatabaseFunctions.getColumnDefinition('startdate', 'timestamp', data.startdate),
                    DatabaseFunctions.getColumnDefinition('enddate', 'timestamp', data.enddate),
                    DatabaseFunctions.getColumnDefinition('log', 'text', data.log),
                    DatabaseFunctions.getColumnDefinition('comment', 'text', data.comment),
                    DatabaseFunctions.getColumnDefinition('tool_id', 'integer', data.tool_id),
                    DatabaseFunctions.getColumnDefinition('transcriber_id', 'integer', data.transcriber_id),
                    DatabaseFunctions.getColumnDefinition('project_id', 'integer', data.project_id),
                    DatabaseFunctions.getColumnDefinition('mediaitem_id', 'integer', data.mediaitem_id),
                    DatabaseFunctions.getColumnDefinition('nexttranscription_id', 'integer', data.nexttranscription_id)
                ]
            };

            const insertionResult = await DatabaseFunctions.dbManager.insert(insertQuery, 'id');

            if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
                const id = insertionResult.rows[0].id;
                const selectResult = await DatabaseFunctions.dbManager.query({
                    text: DatabaseFunctions.selectAllStatements.transcript + ' where id=$1',
                    values: [id]
                });
                this.removePropertiesIfNull(selectResult.rows,
                    insertQuery.columns.filter(a => a.maybeNull).map(a => a.key)
                );
                this.convertColumnsToDatetimeString(selectResult.rows);
                return selectResult.rows as TranscriptRow[];
            }
            throw 'insertionResult does not have id';
        } catch (e) {
            console.log(`[Error]:`);
            console.log(e);
            throw 'Could not save a new tool.';
        }
    }

    public static async removeAppToken(id: number): Promise<void> {
        await DatabaseFunctions.dbManager.connect();

        const removeResult = await DatabaseFunctions.dbManager.query({
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
        const selectResult = await DatabaseFunctions.dbManager.query({
            text: DatabaseFunctions.selectAllStatements.appTokens
        });
        DatabaseFunctions.removePropertiesIfNull(selectResult.rows, ['description', 'domain']);
        this.convertColumnsToDatetimeString(selectResult.rows);
        return selectResult.rows as AppTokensRow[];
    }

    static async createUser(userData: {
        name?: string,
        email?: string,
        password: string
    }): Promise<{
        id: number;
        roles: UserRole[];
    }> {
        await DatabaseFunctions.dbManager.connect();
        const insertAccountQuery = {
            tableName: 'account',
            columns: [
                DatabaseFunctions.getColumnDefinition('username', 'text', userData.name),
                DatabaseFunctions.getColumnDefinition('email', 'text', userData.email),
                DatabaseFunctions.getColumnDefinition('hash', 'text', userData.password)
            ]
        };
        const insertionResult = await DatabaseFunctions.dbManager.insert(insertAccountQuery, 'id');

        if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
            const id = insertionResult.rows[0].id;

            await DatabaseFunctions.assignUserRolesToUser({
                roles: [UserRole.transcriber],
                accountID: id
            });

            const selectResult = await DatabaseFunctions.dbManager.query({
                text: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp, r.label::text as role from account ac full outer join account_roles ar ON ac.id=ar.account_id full outer join roles r ON r.id=ar.roles_id where ac.id=$1::integer',
                values: [
                    id
                ]
            });

            if (selectResult.rowCount > 0) {
                DatabaseFunctions.removePropertiesIfNull(selectResult.rows,
                    [
                        ...insertAccountQuery.columns.filter(a => a.maybeNull).map(a => a.key),
                        'comment', 'training'
                    ]
                );
                this.convertColumnsToDatetimeString(selectResult.rows);
                const roles = (selectResult.rows as AccountRow[]).map(a => a.role).filter(a => !(a === undefined || a === null));

                return {
                    id: selectResult.rows[0].id,
                    roles
                };
            }
        }

        throw 'Could not create user.';
    }

    static async assignUserRolesToUser(data: AssignUserRoleRequest) {
        await DatabaseFunctions.dbManager.connect();
        const rolesTable = await this.getRoles();

        const queries: SQLQuery[] = [];

        // remove all roles from this account at first
        queries.push({
            text: 'delete from account_roles where account_id=$1::integer',
            values: [data.accountID]
        });

        for (const role of data.roles) {
            let roleEntry = rolesTable.find(a => a.label === role);

            if (roleEntry) {
                const roleID = roleEntry.id;
                queries.push({
                    text: 'insert into account_roles(account_id, roles_id) values($1::integer, $2::integer)',
                    values: [data.accountID, roleID]
                });
            } else {
                throw `Could not find role '${role}'`;
            }
        }

        const transactionResult = await DatabaseFunctions.dbManager.transaction(queries);

        if (transactionResult.command === 'COMMIT') {
            return;
        }
        throw 'Could not assign role';
    }

    static async getRoles() {
        const result = await DatabaseFunctions.dbManager.query({
            text: 'select * FROM roles'
        });
        return result.rows as RolesRow[];
    }

    static async listUsers(): Promise<AccountRow[]> {
        await DatabaseFunctions.dbManager.connect();
        const selectResult = await DatabaseFunctions.dbManager.query({
            text: this.selectAllStatements.account
        });

        DatabaseFunctions.removePropertiesIfNull(selectResult.rows, ['comment', 'training']);
        this.convertColumnsToDatetimeString(selectResult.rows);

        return selectResult.rows as AccountRow[];
    }

    static async removeUserByID(id: number): Promise<void> {
        await DatabaseFunctions.dbManager.connect();
        const removeResult = await DatabaseFunctions.dbManager.transaction([
            {
                text: 'update transcript set transcriber_id=null where transcriber_id=$1::integer',
                values: [id]
            },
            {
                text: 'update project set admin_id=null where admin_id=$1::integer',
                values: [id]
            },
            {
                text: 'delete from account_roles where account_id=$1::integer',
                values: [id]
            },
            {
                text: 'delete from account where id=$1::integer',
                values: [id]
            }
        ]);

        if (removeResult.command !== 'COMMIT') {
            throw `Could not remove user account.}.`;
        }
        return;
    }

    static async getUser(id: number): Promise<AccountRow> {
        await DatabaseFunctions.dbManager.connect();
        const selectResult = await DatabaseFunctions.dbManager.query({
            text: this.selectAllStatements.account + ' where id=$1::numeric',
            values: [id]
        });

        if (selectResult.rowCount === 1) {
            DatabaseFunctions.removePropertiesIfNull(selectResult.rows, ['comment', 'training']);
            this.convertColumnsToDatetimeString(selectResult.rows);
            return selectResult.rows[0] as AccountRow;
        }

        throw 'could not find user';
    }

    static async getUserInfoByUserName(name: string): Promise<{
        password: string,
        id: number,
        roles: UserRole[]
    }> {
        await DatabaseFunctions.dbManager.connect();
        const selectResult = await DatabaseFunctions.dbManager.query({
            text: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp, r.label::text as role from account ac full outer join account_roles ar ON ac.id=ar.account_id full outer join roles r ON r.id=ar.roles_id where ac.username=$1::text',
            values: [name]
        });

        const roles = (selectResult.rows as AccountRow[]).map(a => a.role).filter(a => !(a === undefined || a === null));
        const row = selectResult.rows[0] as AccountRow;
        if (selectResult.rowCount > 0) {
            return {
                password: row.hash,
                id: row.id,
                roles
            };
        }

        throw 'could not find user';
    }


    static async getUserInfoByUserID(id: number): Promise<{
        password: string,
        id: number,
        roles: UserRole[]
    }> {
        await DatabaseFunctions.dbManager.connect();
        const selectResult = await DatabaseFunctions.dbManager.query({
            text: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp, r.label::text as role from account ac full outer join account_roles ar ON ac.id=ar.account_id full outer join roles r ON r.id=ar.roles_id where ac.id=$1::integer',
            values: [id]
        });

        const roles = (selectResult.rows as AccountRow[]).map(a => a.role).filter(a => !(a === undefined || a === null));
        const row = selectResult.rows[0] as AccountRow;
        if (selectResult.rowCount > 0) {
            return {
                password: row.hash,
                id,
                roles
            };
        }

        throw 'could not find user';
    }

    static async deliverNewMedia(dataDeliveryRequest: DeliverNewMediaRequest): Promise<void> {
        await DatabaseFunctions.dbManager.connect();
        const projectRow = await DatabaseFunctions.dbManager.query({
            text: 'select id from project where name=$1',
            values: [dataDeliveryRequest.projectName]
        });

        if (projectRow.rowCount < 1) {
            throw 'Could not find a project with this name.'
        }

        const projectID = projectRow.rows[0].id;
        console.log(`found project id ${projectID}`);
        const media = dataDeliveryRequest.media;

        // TODO better use transaction
        const mediaInsertResult = await DatabaseFunctions.addMediaItem({
            url: media.url,
            type: media.type,
            size: media.size,
            metadata: media.metadata
        });

        if (mediaInsertResult.length > 0) {
            const mediaID = mediaInsertResult[0].id;
            console.log(`added media item with id ${mediaID}`);
            const transriptInsertResult = await DatabaseFunctions.addTranscript({
                orgtext: dataDeliveryRequest.orgText,
                transcript: dataDeliveryRequest.transcript,
                project_id: projectID,
                mediaitem_id: mediaID
            });

            if (transriptInsertResult.length > 0) {
                return;
            }
            throw "Could not save transcript entry."
        }
        throw "Could not save media entry."
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

    static removePropertiesIfNull(rows: DatabaseRow[], attributes: string[]) {
        for (const row of rows) {
            for (const attribute of attributes) {
                if (row.hasOwnProperty(attribute) && row[attribute] === null) {
                    delete row[attribute];
                }
            }
        }
    }

    static getColumnDefinition(key: string, type: string, value: any, maybeNull = true) {
        return {
            key, type, value, maybeNull
        };
    }

    static convertColumnsToDatetimeString(rows: DatabaseRow[]) {
        for (const row of rows) {
            for (const attr in row) {
                if (row.hasOwnProperty(attr) && attr.indexOf('date') > -1 && !(row[attr] === undefined || row[attr] === null)) {
                    row[attr] = row[attr].toISOString();
                }
            }
        }
    }
}
