import * as Path from 'path';
import {IAPIConfiguration} from '../../obj/app-config/app-config';
import * as CryptoJS from 'crypto-js';

export class PathBuilder {
  private readonly uploadPath: string;
  private readonly settings: IAPIConfiguration;
  private readonly urlEncryption: {
    key: CryptoJS.lib.WordArray;
    iv: CryptoJS.lib.WordArray;
  };

  constructor(settings: IAPIConfiguration) {
    this.settings = settings;
    this.uploadPath = settings.files.uploadPath;
    this.urlEncryption = {
      key: CryptoJS.enc.Utf8.parse(settings.files.urlEncryption.secret),
      iv: CryptoJS.enc.Utf8.parse(settings.files.urlEncryption.salt)
    };
  }

  public encryptFilePath(path: string) {
    var pw = CryptoJS.enc.Utf8.parse(path);
    var encrypted = CryptoJS.AES.encrypt(pw, this.urlEncryption.key, {
      iv: this.urlEncryption.iv
    });
    //Encrypt string
    return encodeURIComponent(encrypted.toString());
  }

  public decryptFilePath(encryptedPath: string) {
    return CryptoJS.AES.decrypt(decodeURIComponent(encryptedPath), this.urlEncryption.key, {
      iv: this.urlEncryption.iv
    }).toString(CryptoJS.enc.Utf8);
  }

  public getProjectPath(projectID: number) {
    return Path.join(this.uploadPath, 'projects', `project_${projectID}`);
  }

  public getProjectSessionPath(projectID: number, sessionName: string) {
    sessionName = this.sanitizeFileName(sessionName);
    return Path.join(this.getProjectPath(projectID), `session_${sessionName}`);
  }

  public getGuidelinesPath(projectID: number) {
    return Path.join(this.getProjectPath(projectID), 'guidelines');
  }

  public getEncryptedProjectFileURL(projectId: number, session: string, fileName: string) {
    return this.settings.url + Path.join('/v1/files/public/', this.encryptFilePath(Path.join('projects', `project_${projectId}`, `session_${session}`)), Path.basename(fileName));
  }

  public getEncryptedGuidelinesFileURL(projectId: number, fileName: string) {
    return this.settings.url + Path.join('/v1/files/public/', this.encryptFilePath(this.getGuidelinesPath(projectId)), Path.basename(fileName));
  }

  public getEncryptedFileURL(filePath: string) {
    return this.settings.url + Path.join('/v1/files/public/', this.encryptFilePath(Path.dirname(filePath)), Path.basename(filePath));
  }

  public sanitizeFileName(baseName: string) {
    return baseName.replace(/[:&%\\()$/.=?]+/g, "_").replace(/([äÄßüÜöÖ])/g, (g0, g1) => {
      switch (g1) {
        case('ü'):
          return "ue";
        case('Ü'):
          return "Ue";
        case('ä'):
          return "ae";
        case('Ä'):
          return "Ae";
        case('Ö'):
          return "Oe";
        case('ö'):
          return "oe";
        case('ß'):
          return "ss";
      }
    });
  }
}
