import * as Path from 'path';
import * as CryptoJS from 'crypto-js';
import {DateTime} from 'luxon';
import * as http from 'http';
import * as https from 'https';
import {IAPIConfiguration} from '@octra/server-side';

export class PathBuilder {
  public readonly uploadPath: string;
  public readonly projectsPath: string;
  private readonly settings: IAPIConfiguration;
  private readonly urlEncryption: {
    key: CryptoJS.lib.WordArray;
    iv: CryptoJS.lib.WordArray;
  };

  constructor(settings: IAPIConfiguration) {
    this.settings = settings;
    this.uploadPath = settings.paths.uploadFolder;
    this.projectsPath = settings.paths.projectsFolder;
    this.urlEncryption = {
      key: CryptoJS.enc.Utf8.parse(settings.security.keys.url.secret),
      iv: CryptoJS.enc.Utf8.parse(settings.security.keys.url.salt)
    };
  }

  public encryptFilePath(path: string) {
    const pw = CryptoJS.enc.Utf8.parse(path);
    const encrypted = CryptoJS.AES.encrypt(pw, this.urlEncryption.key, {
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

  public getProjectFolderPath(projectID: string) {
    return Path.join(`project_${projectID}`);
  }

  public getAbsoluteProjectPath(projectID: string) {
    return Path.join(this.projectsPath, this.getProjectFolderPath(projectID));
  }

  public getAbsoluteProjectFilesPath(projectID: string) {
    return Path.join(this.projectsPath, this.getProjectFolderPath(projectID), 'files');
  }

  public getAbsoluteGuidelinesPath(projectID: string) {
    return Path.join(this.getAbsoluteProjectPath(projectID), 'guidelines');
  }

  public getGuidelinesFolderPath(projectID: string) {
    return Path.join(this.getProjectFolderPath(projectID), 'guidelines');
  }

  public getEncryptedFileURL(path: string) {
    const folder = Path.parse(path).dir;
    const fileName = Path.basename(path);
    return this.settings.url + (this.settings.port ? `:${this.settings.port}` : '') + Path.join(this.settings.baseURL, '/files/', this.encryptFilePath(folder), Path.basename(path));
  }

  public getEncryptedGuidelinesFileURL(projectID: string, fileName: string) {
    return this.settings.url + Path.join('/files/', this.encryptFilePath(Path.join('{projects}', `project_${projectID}`)), Path.basename(fileName));
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

  public isEncryptedURL(url: string): boolean {
    const regex = new RegExp(`^${Path.join(this.settings.url, 'files')}`);
    return (regex.exec(url) !== null);
  }

  public isURL(url: string): boolean {
    return (url && url.trim() !== '' && /^https?:\/\//g.exec(url).length > 0);
  }

  public isLocalPath(path: string): boolean {
    return (path && path.trim() !== '' && /^\{projects}/g.exec(path).length > 0);
  }
}
