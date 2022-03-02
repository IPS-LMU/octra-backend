import {UserRole} from '../db';

export interface CreateProjectRequest {
  name: string;
  shortname?: string;
  description?: string;
  configuration?: any;
  startdate?: string;
  enddate?: string;
  admin_id: number;
}

export interface ChangeProjectRequest extends CreateProjectRequest {
  active: boolean;
}

export interface CreateAppTokenRequest {
  name: string;
  domain?: string;
  description?: string;
}

export interface UserLoginRequest {
  type: 'shibboleth' | 'local',
  email?: string;
  name?: string;
  password?: string;
}

export interface UserRegisterRequest {
  name: string;
  email: string;
  password: string;
}

// TODO change this
export interface AddFileRequest {
  project_id: number;
  url: string;
  type?: string;
  size?: number;
  metadata?: string;
  session: string;
  originalname: string;
  filename: string;
}

export interface AddUploadItemRequest {
  file: File;
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
  transcript?: any;
  assessment?: string;
  priority?: string;
  status?: string;
  code?: string;
  creationdate?: string;
  startdate?: string;
  enddate?: string;
  log?: any;
  comment?: string;
  tool_id?: number;
  transcriber_id?: number;
  project_id?: number;
  file_id?: number;
  nexttranscript_id?: number;
}

export interface AssignUserRoleRequest {
  accountID: number;
  roles: {
    role: UserRole,
    project_id?: number
  }[];
}

export interface DeliverNewMediaRequest {
  project_id: number;
  file?: {
    url: string;
    type?: string;
    size?: number;
    metadata?: any;
    session: string;
    folder_path: string;
    filename: string;
  },
  orgtext?: string;
  transcript?: any;
}

export interface GetProjectTranscriptsRequest {
  projectName: string;
}

export interface StartAnnotationRequest {
  tool_id: number;
}

export interface SaveAnnotationRequest {
  transcript: any,
  comment?: string,
  assessment?: string,
  log?: any,
  tool_id?: string
}

export interface CreateGuidelinesRequest {
  language: string;
  json: any;
}

export interface RemoveProjectRequest {
  removeAllReferences?: boolean;
  cutAllReferences?: boolean;
}
