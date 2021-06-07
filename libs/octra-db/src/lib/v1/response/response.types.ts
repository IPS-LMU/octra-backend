import {MediaItemRow, UserRole} from '../db';

export interface ProjectTranscriptsGetResult {
  id: number;
  pid?: string;
  orgtext?: string;
  transcript?: string;
  assessment?: string;
  priority?: number;
  status?: string;
  code?: string;
  creationdate?: string;
  startdate?: string;
  enddate?: string;
  log?: string;
  comment?: string;
  tool_id?: number;
  transcriber_id?: number;
  mediaitem_id?: number;
  mediaitem?: MediaItemRow;
  nexttranscript?: number;
}

export interface TranscriptGetResult extends ProjectTranscriptsGetResult {
  project_id?: number;
}

export interface UserInfoResult {
  id: number;
  username: string;
  roles?: UserRole[];
  createdate: string;
  active: boolean;
  training?: string;
  loginmethod: string;
  comment?: string;
}

export interface APIResponse {
  status: 'success' | 'error';
  token?: string;
  authenticated: boolean;
  message?: string;
  data?: any;
}

export interface AppTokenChangeResponse extends APIResponse {
  data: {
    name: string;
    key: string;
    domain?: string;
    description?: string;
    registrations?: boolean;
  }
}

export interface AppTokenCreateResponse extends APIResponse {
  data: {
    name: string;
    key: string;
    domain?: string;
    description?: string;
    registrations?: boolean;
  }
}

export interface AppTokenListResponse extends APIResponse {
  data: {
    id: number;
    name: string;
    key: string;
    domain?: string;
    description?: string;
    registrations?: boolean;
  }[]
}

export interface AppTokenRefreshResponse extends APIResponse {
  data: {
    name: string;
    key: string;
    domain?: string;
    description?: string;
    registrations?: boolean;
  }
}

export interface AppTokenRemoveResponse extends APIResponse {
  data: {}
}

export interface DeliveryMediaAddResponse extends APIResponse {
  data: ProjectTranscriptsGetResult
}

export interface MediaAddResponse extends APIResponse {
  data: {
    id: number;
    url: string;
    type: string;
    size: number;
    metadata: string;
  }
}

export interface ProjectCreateResponse extends APIResponse {
  data: {
    id: number;
    name: string;
    shortname?: string;
    description?: string;
    configuration?: string;
    startdate?: string;
    enddate?: string;
    active?: boolean;
    admin_id?: number
  }
}

export interface ProjectListResponse extends APIResponse {
  data: {
    id: number;
    name: string;
    shortname?: string;
    description?: string;
    configuration?: string;
    startdate?: string;
    enddate?: string;
    active?: boolean;
    admin_id?: number
  }[];
}

export interface ProjectTranscriptsGetResponse extends APIResponse {
  data: ProjectTranscriptsGetResult[]
}

export interface ToolAddResponse extends APIResponse {
  data: {
    id: number;
    pid?: string;
    name: string;
    version?: string;
    description?: string;
  }
}

export interface TranscriptAddResponse extends APIResponse {
  data: {
    id: number;
    pid?: string;
    orgtext?: string;
    transcript?: string;
    assessment?: string;
    priority?: number;
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
    nexttranscript?: number;
  }
}

export interface TranscriptGetResponse extends APIResponse {
  data: TranscriptGetResult
}

export interface UserAssignRolesResponse extends APIResponse {
  data: {}
}

export interface UserCurrentInfoResponse extends APIResponse {
  data: UserInfoResult;
}

export interface UserExistsHashResponse extends APIResponse {
  data: boolean;
}

export interface UserInfoResponse extends APIResponse {
  data: UserInfoResult;
}

export interface UserListResponse extends APIResponse {
  data: UserInfoResult[];
}

export interface UserLoginResponse extends APIResponse {
  token: string;
  data: {
    id?: number;
    name?: string;
    openURL?: string;
  }
}

export interface UserPasswordChangeResponse extends APIResponse {
  data: {}
}

export interface UserRegisterResponse extends APIResponse {
  token: string;
  data: {
    id: number;
  }
}

export interface UserRemoveResponse extends APIResponse {
  data: {};
}

export interface GuidelinesSaveResponse extends APIResponse {
  data: {
    language: string;
    json: any;
  };
}

export interface GuidelinesGetResponse extends APIResponse {
  data: {
    language: string;
    json: any;
  }[];
}
