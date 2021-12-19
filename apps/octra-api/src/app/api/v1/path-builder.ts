import * as path from 'path';
import {IAPIConfiguration} from '../../obj/app-config/app-config';
import * as CryptoJS from 'crypto-js';

export class PathBuilder {
  private readonly uploadPath: string;
  private readonly urlEncryption: {
    key: string;
    iv: string;
  };

  constructor(settings: IAPIConfiguration) {
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
    return path.join(this.uploadPath, 'projects', `project_${projectID}`);
  }

  public getGuidelinesPath(projectID: number) {
    return this.encryptFilePath(path.join(this.getProjectPath(projectID), 'guidelines'));
  }
}
