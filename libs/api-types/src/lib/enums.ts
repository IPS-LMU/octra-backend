export enum ProjectUserRole {
  transcriber = 'transcriber',
  projectAdministrator = 'project_admin',
  dataDelivery = 'data_delivery',
}

export enum ProjectVisibility {
  public = 'public',
  private = 'private'
}

export enum GlobalUserRole {
  administrator = 'administrator',
  user = 'user',
  public = 'public'
}

export enum AccountRole {
  administrator = 'administrator',
  transcriber = 'transcriber',
  projectAdministrator = 'project_admin',
  dataDelivery = 'data_delivery',
  public = 'public',
  user = 'user'
}

export enum AccountRoleScope {
  general = 'general',
  project = 'project'
}

export enum TaskStatus {
  draft = 'DRAFT',
  free = 'FREE',
  busy = 'BUSY',
  finished = 'FINISHED',
  failed = 'FAILED',
  postponed = 'POSTPONED'
}

export enum TaskInputOutputCreatorType {
  'user' = 'user'
}

export enum AccountLoginMethod {
  'local' = 'local',
  'shibboleth' = 'shibboleth'
}
