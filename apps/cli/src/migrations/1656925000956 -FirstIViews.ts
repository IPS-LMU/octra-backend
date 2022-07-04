import {DataSource, MigrationInterface, QueryRunner} from 'typeorm';
import {AccountEntity} from '@octra/server-side';
import {OctraMigration} from '../octra-migration';
import {View} from 'typeorm/schema-builder/view/View';

export class FirstIViews1656925000956 extends OctraMigration implements MigrationInterface {
  constructor() {
    super();
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log(`create account_all view...`);
    await queryRunner.createView(new View({
      name: 'account_all',
      materialized: false,
      expression: (connection: DataSource) => {
        return connection.createQueryBuilder(AccountEntity, 'a')
          .innerJoin('account_person', 'p', 'a.account_person_id = p.id')
          .innerJoin('role', 'r', 'a.role_id = r.id')
          .select('a.id', 'id')
          .addSelect('p.id', 'person_id')
          .addSelect('p.username', 'username')
          .addSelect('p.email', 'email')
          .addSelect('p.loginmethod', 'loginmethod')
          .addSelect('p.hash', 'hash')
          .addSelect('p.active', 'active')
          .addSelect('a.training', 'training')
          .addSelect('a.comment', 'comment')
          .addSelect('r.label', 'role')
          .addSelect('a.updatedate', 'updatedate')
          .addSelect('a.creationdate', 'creationdate')
      }
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
