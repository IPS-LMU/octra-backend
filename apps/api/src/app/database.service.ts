import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(private connection: Connection) {
  }

  public async transaction<T>(callback: (manager: EntityManager) => Promise<T>): Promise<T> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;

    try {
      const result = await callback(manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      // since we have errors lets rollback the changes we made
      console.log(`!!-- SQL ERROR! ${Object.keys(err)}`);
      console.log(JSON.stringify(err));
      await queryRunner.rollbackTransaction();
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
