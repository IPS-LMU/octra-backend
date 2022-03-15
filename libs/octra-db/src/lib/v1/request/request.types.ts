import {AudioFileMetaData, GlobalUserRole, TranscriptStatus} from '../db';

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

export interface AddFileRequest {
  url: string;
  uploader_id: number;
  type?: string;
  size?: number;
  original_name?: string;
  hash?: string;
  metadata?: AudioFileMetaData;
}

export interface AddFileProjectRequest {
  project_id: number;
  file_id: number;
  virtual_folder_path: string;
  virtual_filename: string;
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
  role: GlobalUserRole;
}

export interface DeliverNewMediaRequest {
  project_id: number;
  file?: {
    url: string;
    file_id: number;
    virtual_folder_path?: string;
    virtual_filename: string;
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
  removeAllReferences: boolean;
  cutAllReferences: boolean;
  removeProjectFiles: boolean;
}

export interface ProjectTranscriptsChangeStatusRequestItem {
  status: TranscriptStatus;
  listOfIds: number[];
}

export interface AssignProjectUserRolesRequestItem {
  userID: number;
  role: string;
  valid_startdate?: string;
  valid_enddate?: string;
}
