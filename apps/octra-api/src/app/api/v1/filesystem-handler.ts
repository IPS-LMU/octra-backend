import * as fs from 'fs';

export class FileSystemHandler {

  static existsPath(path) {
    try {
      fs.accessSync(path);
      return true;
    } catch (e) {
      return false;
    }
  }

  static mkDir(path) {
    try {
      fs.mkdirSync(path);
      return true;
    } catch (e) {
      return false;
    }
  }

  static getFileContent(path): string {
    try {
      return fs.readFileSync(path, {encoding: 'utf-8'});
    } catch (e) {
      return null;
    }
  }

  static createFile(path, data) {
    try {
      fs.writeFileSync(path, data);
      return true;
    } catch (e) {
      return false;
    }
  }
}
