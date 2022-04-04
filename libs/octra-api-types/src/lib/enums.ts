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
