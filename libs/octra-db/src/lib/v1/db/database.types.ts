export enum UserRole {
  administrator = 'administrator',
  transcriber = 'transcriber',
  projectAdministrator = 'project_admin',
  dataDelivery = 'data_delivery',
  public = 'public'
}

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
  role: UserRole[];
}

export interface AccountRolesRow {
  account_id: number;
  role_id: number;
}

export interface RolesRow extends DatabaseRow {
  label: UserRole;
  description: string;
}

export interface AppTokensRow extends DatabaseRow {
  name: string;
  key: string;
  domain: string;
  description: string;
  registrations: boolean;
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
  assessment: string;
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
  nexttranscript_id: number;
}

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
  transcripts_free_count?: number;
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
