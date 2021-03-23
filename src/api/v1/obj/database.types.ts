export interface DatabaseRow {
    id: number;
}

export interface AccountRow extends DatabaseRow {
    username: string;
    email: string;
    loginmethod: string;
    createdate: string;
    active: boolean;
    hash: string;
    training: string;
    comment: string;
}

export interface AccountRolesRow {
    account_id: number;
    roles_id: number;
}

export interface AppTokensRow extends DatabaseRow {
    name: string;
    key: string;
    domain: string;
    description: string;
}

export interface MediaItemRow extends DatabaseRow {
    url: string;
    type: string;
    size: number;
    metadata: string;
}

export interface ProjectRow extends DatabaseRow {
    name: string;
    shortname: string;
    description: string;
    configuration: string; // JSON as string
    startdate: string; //timestamp without timezone
    enddate: string; //timestamp without timezone
    active: boolean;
    admin_id: number;
}

export interface ToolRow extends DatabaseRow {
    name: string;
    version: string;
    description: string;
    pid: string;
}

export interface TranscriptRow extends DatabaseRow {
    pid: string;
    orgtext: string;
    transcript: string;
    assassment: string;
    priority: number;
    status: string;
    code: string;
    creationdate: string;
    startdate: string;
    enddate: string;
    log: string;
    comment: string;
    tool_id: number;
    transcriber_id: number;
    project_id: number;
    mediaitem_id: number;
    nexttranscription_id: number;
}
