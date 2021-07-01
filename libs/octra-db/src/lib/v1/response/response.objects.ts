import {MediaItemRow, UserRole} from '../db';

export interface AppTokenChangeResponseDataItem {
  name: string;
  key: string;
  domain?: string;
  description?: string;
  registrations?: boolean;
}

export interface ProjectResponseDataItem {
  id: number;
  name: string;
  shortname?: string;
  description?: string;
  configuration?: any;
  startdate?: string;
  enddate?: string;
  active?: boolean;
  admin_id?: number;
  transcripts_count: number;
  transcripts_count_free: number;
}

export interface AppTokenResponseDataItem {
  id: number;
  name: string;
  key: string;
  domain?: string;
  description?: string;
  registrations?: boolean;
}

export interface AppTokenRefreshResponseDataItem {
  name: string;
  key: string;
  domain?: string;
  description?: string;
  registrations?: boolean;
}


export interface ToolAddResponseDataItem {
  id: number;
  pid?: string;
  name: string;
  version?: string;
  description?: string;
}

export interface TranscriptAddResponseDataItem {
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

export interface MediaAddResponseDataItem {
  id: number;
  url: string;
  type: string;
  size: number;
  metadata: string;
}

export interface ProjectCreateResponseDataItem {
  id: number;
  name: string;
  shortname?: string;
  description?: string;
  configuration?: any;
  startdate?: string;
  enddate?: string;
  active?: boolean;
  admin_id?: number
}

export interface UserLoginResponseDataItem {
  id?: number;
  name?: string;
  openURL?: string;
}

export interface UserRegisterResponseDataItem {
  id: number;
}

export interface GuidelinesSaveResponseDataItem {
  language: string;
  json: any;
}

export interface ProjectTranscriptsGetResponseDataItem {
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

export interface TranscriptGetResponseDataItem extends ProjectTranscriptsGetResponseDataItem {
  project_id?: number;
}

export interface UserInfoResponseDataItem {
  id: number;
  username: string;
  email: string;
  roles?: UserRole[];
  createdate: string;
  active: boolean;
  training?: string;
  loginmethod: string;
  comment?: string;
}

export interface AnnotationStartResponseDataItem {
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
  log?: any[];
  comment?: string;
  tool_id?: number;
  transcriber_id?: number;
  mediaitem_id?: number;
  mediaitem?: MediaItemResponseDataItem;
  nexttranscript?: number;
  transcripts_free_count: number;
}

export interface MediaItemResponseDataItem {
  url: string;
  type: string;
  size: number;
  metadata: string;
}
