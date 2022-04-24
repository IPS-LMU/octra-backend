import {FileSystemStoredFile, StoredFile} from 'nestjs-form-data';
import {FormDataInterceptorConfig} from 'nestjs-form-data/dist/interfaces';
import {mkdirp} from 'fs-extra';
import * as path from 'path';
import {ParsedPath} from 'path';
import * as fs from 'fs';
import {plainToClass} from 'class-transformer';
import * as crypto from 'crypto';

export class FileHashStorage extends StoredFile {
  mimetype: string;
  encoding: string;
  originalName: string;
  size: number;
  path: string;

  delete(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.unlink(this.path, (err: any) => {

        if (err && err.code !== 'ENOENT') {
          return reject(err);
        }

        resolve();
      });
    });
  }

  static override async create(originalName, encoding, mimetype, stream: NodeJS.ReadableStream, config: FormDataInterceptorConfig): Promise<FileSystemStoredFile> {
    await mkdirp(config.fileSystemStoragePath);
    const filePath = path.resolve(config.fileSystemStoragePath, FileHashStorage.makeFileNameWithSalt(originalName));

    return new Promise<FileSystemStoredFile>((res, rej) => {
      const outStream = fs.createWriteStream(filePath);
      let size: number = 0;
      const hash = crypto.createHash('sha256');
      stream.on('data', (chunk) => {
        size += chunk.length;
        hash.update(chunk)
      });
      outStream.on('error', rej);
      outStream.on('finish', () => {
        const file: FileSystemStoredFile = plainToClass(FileSystemStoredFile, {
          originalName,
          encoding,
          mimetype,
          path: filePath,
          size,
          hash: hash.digest('hex')
        });

        res(file);
      });
      stream.pipe(outStream);
    });
  }

  private static makeFileNameWithSalt(originalName: string): string {
    const hash = crypto.createHash('md5');
    const parsed: ParsedPath = path.parse(originalName);
    hash.write(`${Date.now()}_${parsed.name}`);
    return `${hash.digest('hex')}${parsed.ext}`;
  }
}
