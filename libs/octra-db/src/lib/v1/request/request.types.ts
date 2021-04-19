import {UserRole} from '../db/database.types';

export interface CreateProjectRequest {
    name: string;
    shortname?: string;
    description?: string;
    configuration?: string;
    startdate?: string;
    enddate?: string;
    active?: boolean;
    admin_id?: number;
}

export interface CreateAppTokenRequest {
    name: string;
    domain?: string;
    description?: string;
}

export interface UserLoginRequest {
    type: 'shibboleth' | 'local',
    name?: string;
    password?: string;
}

export interface UserRegisterRequest {
    name: string;
    email?: string;
    password: string;
}

export interface AddMediaItemRequest {
    url: string;
    type?: string;
    size?: number;
    metadata?: string;
}

export interface AddToolRequest {
    name?: string;
    version?: string;
    description?: number;
    pid?: string;
}

export interface AddTranscriptRequest {
    pid?: string;
    orgtext?: string;
    transcript?: string;
    assessment?: string;
    priority?: string;
    status?: string;
    code?: string;
    creationdate?: string;
    startdate?: string;
    enddate?: string;
    log?: string;
    comment?: string;
    tool_id?: number;
    transcriber_id?: number;
    project_id?: number;
    mediaitem_id?: number;
    nexttranscript_id?: number;
}

export interface AssignUserRoleRequest {
    accountID: number;
    roles: UserRole[];
}

export interface DeliverNewMediaRequest {
    project_id: number;
    media: {
        url: string;
        type?: string;
        size?: number;
        metadata?: string;
    },
    orgtext?: string;
    transcript?: string;
}

export interface GetProjectTranscriptsRequest {
    projectName: string;
}

export interface TokenData {
    id: number;
    role: UserRole[]
}
