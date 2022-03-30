import {AccessRight, DatabaseRow, FileMetaData, PreparedTaskRow} from '../db';

export interface AppTokenChangeResponseDataItem extends DatabaseRow {
  name: string;
  key: string;
  domain?: string;
  description?: string;
  registrations?: boolean;
}

export interface ProjectResponseDataItem extends ProjectCreateResponseDataItem {
  name: string;
  shortname?: string;
  description?: string;
  configuration?: any;
  startdate?: string;
  enddate?: string;
  active?: boolean;
  account_roles?: AccessRight[];
  transcripts_count: number;
  transcripts_count_free: number;
}

export interface AppTokenResponseDataItem extends DatabaseRow {
  name: string;
  key: string;
  domain?: string;
  description?: string;
  registrations?: boolean;
}

export interface AppTokenRefreshResponseDataItem extends AppTokenResponseDataItem {
}


export interface ToolAddResponseDataItem extends DatabaseRow {
  pid?: string;
  name: string;
  version?: string;
  description?: string;
}

export interface TranscriptAddResponseDataItem extends DatabaseRow {
  pid?: string;
  orgtext?: string;
  transcript?: string;
  assessment?: string;
  priority?: number;
  status?: string;
  code?: string;
  startdate?: string;
  enddate?: string;
  log?: string;
  comment?: string;
  tool_id?: number;
  transcriber_id?: number;
  project_id?: number;
  file_id?: number;
  nexttranscript?: number;
}

export interface MediaAddResponseDataItem extends DatabaseRow {
  url: string;
  type: string;
  size: number;
  metadata: string;
}

export interface ProjectCreateResponseDataItem extends DatabaseRow {
  name: string;
  shortname?: string;
  description?: string;
  configuration?: any;
  startdate?: string;
  enddate?: string;
  active?: boolean;
  account_roles?: AccessRight[]
}

export interface UserLoginResponseDataItem {
  user?: UserInfoResponseDataItem,
  openURL?: string;
}

export interface UserRegisterResponseDataItem extends DatabaseRow {
}

export interface GuidelinesSaveResponseDataItem {
  language: string;
  json: any;
}

export interface ProjectTranscriptsGetResponseDataItem extends PreparedTaskRow {
}

export interface TranscriptGetResponseDataItem extends ProjectTranscriptsGetResponseDataItem {
  project_id?: number;
}

export interface UserInfoResponseDataItem extends DatabaseRow {
  username: string;
  email: string;
  hash?: string;
  active: boolean;
  training?: string;
  loginmethod: string;
  comment?: string;
  accessRights: AccessRight[];
}

export interface AnnotationStartResponseDataItem extends PreparedTaskRow {
}

export interface ProjectFileItemResponseDataItem extends DatabaseRow {
  url: string;
  type: string;
  size: number;
  metadata: FileMetaData;
}
