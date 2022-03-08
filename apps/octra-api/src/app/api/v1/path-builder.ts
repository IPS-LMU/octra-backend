import * as Path from 'path';
import {IAPIConfiguration} from '../../obj/app-config/app-config';
import * as CryptoJS from 'crypto-js';
import {DateTime} from 'luxon';
import * as http from 'http';
import * as https from 'https';

export class PathBuilder {
  public readonly uploadPath: string;
  private readonly projectsPath: string;
  private readonly settings: IAPIConfiguration;
  private readonly urlEncryption: {
    key: CryptoJS.lib.WordArray;
    iv: CryptoJS.lib.WordArray;
  };

  constructor(settings: IAPIConfiguration) {
    this.settings = settings;
    this.uploadPath = settings.files.uploadPath;
    this.projectsPath = settings.files.projectsPath;
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

  public getProjectFolderPath(projectID: number) {
    return Path.join(`project_${projectID}`);
  }

  public getAbsoluteProjectPath(projectID: number) {
    return Path.join(this.projectsPath, this.getProjectFolderPath(projectID));
  }

  public getAbsoluteGuidelinesPath(projectID: number) {
    return Path.join(this.getAbsoluteProjectPath(projectID), 'guidelines');
  }

  public getGuidelinesFolderPath(projectID: number) {
    return Path.join(this.getProjectFolderPath(projectID), 'guidelines');
  }

  public getEncryptedProjectFileURL(projectId: number, fileName: string) {
    return this.settings.url + Path.join('/v1/files/public/', this.encryptFilePath(Path.join(`{projects}`, `project_${projectId}`)), Path.basename(fileName));
  }

  public getEncryptedUploadURL(relativePath: string) {
    const folder = Path.join(`{uploads}`, relativePath.substring(0, relativePath.lastIndexOf('/')));
    return this.settings.url + Path.join('/v1/files/public/', this.encryptFilePath(folder), Path.basename(relativePath));
  }

  public getEncryptedGuidelinesFileURL(projectId: number, fileName: string) {
    return this.settings.url + Path.join('/v1/files/public/', this.encryptFilePath(Path.join('{projects}', `project_${projectId}`)), Path.basename(fileName));
  }

  public getAbsoluteUploadPath() {
    const now = DateTime.now();
    const folder = now.setLocale('de').toFormat('yyyy-MM');

    return Path.join(this.uploadPath, `${folder}`)
  }

  public readPublicURL(publicURL: string) {
    return publicURL.replace(/((?:{uploads})|(?:{projects}))/g, (g0, g1) => {
      if (g1 === '{uploads}') {
        return this.uploadPath;
      } else if (g1 === '{projects}') {
        return this.projectsPath;
      }
      return g1;
    });
  }

  public extractFileNameFromURL(url: string) {
    return url.replace(/.+\/([^/]+)$/g, '$1');
  }

  public async getInformationFomURL(url: string) {
    return new Promise<{
      size: number;
      type: string;
    }>((resolve, reject) => {
      const httpClient = (url.indexOf('https') === 0) ? https : http;
      httpClient.request(url, {method: 'HEAD'}, (res) => {
        resolve({
          size: Number(res.headers['content-length']),
          type: res.headers['content-type']
        });
      }).on('error', (err) => {
        reject('Can\'t find file from URL.');
      }).end();
    });
  }
}
