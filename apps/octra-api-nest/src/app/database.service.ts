import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from "typeorm";

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
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
