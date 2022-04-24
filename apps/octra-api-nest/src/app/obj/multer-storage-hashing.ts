import * as fs from 'fs';
import {DiskStorageOptions, StorageEngine} from 'multer';
import * as Path from 'path';
import * as os from 'os';
import {mkdirpSync} from 'fs-extra';
import * as crypto from 'crypto';
import {Express} from 'express';

export interface MulterHashedFile extends Express.Multer.File {
  hash: string;
}

export class MulterStorageHashing implements StorageEngine {
  getFilename(req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
      cb(err, err ? undefined : raw.toString('hex'))
    })
  }

  getDestination(req, file, cb) {
    cb(null, os.tmpdir())
  };

  constructor(opts: DiskStorageOptions) {
    this.getFilename = (opts.filename || this.getFilename)

    if (typeof opts.destination === 'string') {
      mkdirpSync(opts.destination);
      this.getDestination = ($0, $1, cb) => {
        cb(null, opts.destination)
      }
    } else {
      this.getDestination = (opts.destination || this.getDestination)
    }
  }

  _handleFile(req, file, cb) {
    this.getDestination(req, file, (err, destination) => {
      if (err) return cb(err)

      this.getFilename(req, file, (err, filename) => {
        if (err) return cb(err)

        var finalPath = Path.join(destination, filename);
        var outStream = fs.createWriteStream(finalPath);

        // TODO hash only if it's a file

        file.stream.pipe(outStream)
        outStream.on('error', cb);
        const hash = crypto.createHash('sha256')
        file.stream.on('data', function (chunk) {
          hash.update(chunk)
        });
        outStream.on('finish', () => {
          cb(null, {
            destination: destination,
            filename: filename,
            path: finalPath,
            size: outStream.bytesWritten,
            hash: hash.digest('hex')
          })
        })
      })
    });
  }

  _removeFile(req, file, cb) {
    var path = file.path

    delete file.destination
    delete file.filename
    delete file.path

    fs.unlink(path, cb)
  }
}
