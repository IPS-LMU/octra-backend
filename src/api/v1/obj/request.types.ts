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
    name: string;
    password: string;
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
