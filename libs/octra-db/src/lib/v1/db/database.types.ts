export enum ProjectUserRole {
  transcriber = 'transcriber',
  projectAdministrator = 'project_admin',
  dataDelivery = 'data_delivery',
}

export enum GlobalUserRole {
  administrator = 'administrator',
  user = 'user'
}

export enum UserRole {
  administrator = 'administrator',
  transcriber = 'transcriber',
  projectAdministrator = 'project_admin',
  dataDelivery = 'data_delivery',
  public = 'public',
  user = 'user'
}

export enum UserRoleScope {
  general = 'general',
  project = 'project'
}

export enum TaskStatus {
  draft = 'DRAFT',
  free = 'FREE',
  annotated = 'ANNOTATED',
  postponed = 'POSTPONED'
}

export interface AccessRight {
  role: UserRole;
  scope?: UserRoleScope;
  project_id?: number;
  project_name?: string;
  valid_startdate?: string;
  valid_enddate?: string;
}

export interface DatabaseRow {
  id: number;
  creationdate: string;
  updatedate: string;
}

export interface AccountRow extends DatabaseRow {
  username?: string;
  email?: string;
  loginmethod?: string;
  active?: boolean;
  hash?: string;
  training: string;
  comment: string;
  role: UserRole;
  last_login?: string;
}

export interface PreparedAccountRow extends AccountRow {
  accessRights: AccessRight[];
}

export interface AccountRoleProjectRow {
  account_id: number;
  role_id: number;
  project_id: number;
  valid_startdate: string;
  valid_enddate: string;
  creationdate: string;
  updatedate: string;
}

export interface RolesRow extends DatabaseRow {
  label?: UserRole;
  description?: string;
  scope: 'general' | 'project';
}

export interface AppTokensRow extends DatabaseRow {
  name: string;
  key: string;
  domain?: string;
  description?: string;
  registrations?: boolean;
}

export interface FileMetaData {
}

export interface AudioFileMetaData extends FileMetaData {
  bitRate: number;
  numberOfChannels: number;
  duration: { samples: number, seconds: number };
  sampleRate: number;
  container: string;
  codec: string;
  lossless: boolean;
}

export interface FileRow extends DatabaseRow {
  url: string;
  type?: string;
  size?: number;
  original_name: string;
  uploader_id?: number;
  metadata: AudioFileMetaData;
  hash: string;
}

export interface FileProjectRow extends DatabaseRow {
  file_id: number;
  project_id: number;
  virtual_folder_path: string;
  virtual_filename: string;
}

export interface PreparedFileProjectRow extends FileRow {
  project_id: number;
  path: string;
  filename: string;
}

export interface ProjectRow extends DatabaseRow {
  name: string;
  shortname?: string;
  description?: string;
  configuration?: any; // JSON as string
  startdate: string; //timestamp without timezone
  enddate: string; //timestamp without timezone
  active: boolean;
}

export interface PreparedProjectRow extends ProjectRow {
  projectAdmins: AccessRight[];
}

export interface ToolRow extends DatabaseRow {
  name: string;
  version?: string;
  description?: string;
  pid?: string;
}

export interface TaskRow extends TaskProperties, DatabaseRow {
  log?: any; // TODO define structure
}

export interface TaskProperties {
  pid?: string;
  orgtext?: string;
  assessment?: string;
  priority?: number;
  status?: string;
  code?: string;
  startdate?: string;
  enddate?: string;
  comment?: string;
  tool_id?: number;
  project_id?: number;
  admin_comment?: string;
  worker_id?: number;
  nexttask_id?: number;
  type: 'annotation';
}

export interface PreparedTaskRow extends TaskRow {
  inputs: TaskInputOutputRow[];
  outputs: TaskInputOutputRow[];
  tasks_count_free?: number;
  tasks_count?: number;
}

export interface TaskInputOutputRow {
  task_id?: number;
  file_project_id?: number;
  type: 'input' | 'output';
  creator_type: 'uploader' | 'annotator';
  label: string;
  description?: string;
  filename?: string;
  url?: string;
  content?: string;
}
