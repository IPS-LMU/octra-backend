import * as Path from 'path';
import * as CryptoJS from 'crypto-js';
import {DateTime} from 'luxon';
import * as http from 'http';
import * as https from 'https';
import {IAPIConfiguration} from "@octra/server-side";

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

  public getAbsoluteGuidelinesPath(projectID: string) {
    return Path.join(this.getAbsoluteProjectPath(projectID), 'guidelines');
  }

  public getGuidelinesFolderPath(projectID: string) {
    return Path.join(this.getProjectFolderPath(projectID), 'guidelines');
  }

  public getEncryptedProjectFileURL(projectID: string, fileName: string) {
    return this.settings.url + Path.join('/v1/files/public/', this.encryptFilePath(Path.join(`{projects}`, `project_${projectID}`)), Path.basename(fileName));
  }

  public getEncryptedUploadURL(relativePath: string, virtual_filename: string) {
    if (relativePath && /https?:\/\//g.exec(relativePath) === null) {

      const folder = Path.join(`{uploads}`, Path.parse(relativePath).dir);
      const fileName = Path.basename(relativePath);
      return this.settings.url + (this.settings.port ? `:${this.settings.port}` : '') + Path.join('/v1/files/public/', this.encryptFilePath(folder), fileName);
    }
    return relativePath;
  }

  public getEncryptedGuidelinesFileURL(projectID: string, fileName: string) {
    return this.settings.url + Path.join('/v1/files/public/', this.encryptFilePath(Path.join('{projects}', `project_${projectID}`)), Path.basename(fileName));
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
