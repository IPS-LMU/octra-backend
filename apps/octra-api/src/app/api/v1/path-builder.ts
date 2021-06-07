import * as path from 'path';

export class PathBuilder {
  public static getProjectPath(projectID: number, uploadPath: string) {
    return path.join(uploadPath, 'projects', `project_${projectID}`);
  }

  public static getGuidelinesPath(projectID: number, uploadPath: string) {
    return path.join(PathBuilder.getProjectPath(projectID, uploadPath), 'guidelines');
  }
}
