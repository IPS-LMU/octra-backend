import * as fs from 'fs';
import {MakeDirectoryOptions} from 'fs';
import * as fsExtra from 'fs-extra';
import {WriteFileOptions} from 'fs-extra';
import * as pathFunctions from 'path';

export class FileSystemHandler {
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

  /**
   * write a file to given path. Creates subfolders automatically.
   * @param path
   * @param data
   * @param options
   */
  public static async saveFileAsync(path: string, data: any, options?: WriteFileOptions) {
    await fsExtra.createFile(path);
    return fsExtra.writeFile(path, data, options);
  }

  /**
   * create a directory
   * @param path
   * @param options
   */
  public static async createDirIfNotExists(path: string, options?: MakeDirectoryOptions) {
    const exists = await fsExtra.pathExists(path);

    if (exists) {
      return;
    }
    return fsExtra.mkdir(path, options);
  }

  /**
   * removes a folder an it's contents
   * @param path
   */
  public static async removeFolder(path: string) {
    if (await fsExtra.pathExists(path)) {
      const files = await fsExtra.readdir(path);

      for (const file of files) {
        const curPath = pathFunctions.join(path, file);
        const lstat = await fsExtra.lstat(curPath);
        if (lstat.isDirectory()) {
          // recurse
          await FileSystemHandler.removeFolder(curPath);
        } else {
          // delete file
          await fsExtra.unlink(curPath);
        }
      }
      return fsExtra.rmdir(path);
    }
    return;
  }

  public static async listFiles(path: string): Promise<{
    fileName: string;
    content: string;
  }[]> {
    const result: {
      fileName: string;
      content: string;
    }[] = [];
    if (await fsExtra.pathExists(path)) {
      const lstat = await fsExtra.lstat(path);

      if (lstat.isDirectory()) {
        const files = await fsExtra.readdir(path);
        for (const fileName of files) {
          const content = await fsExtra.readFile(pathFunctions.join(path, fileName), {
            encoding: 'utf-8'
          });
          result.push({
            fileName,
            content
          });
        }
      }
    }
    return result;
  }
}
