import { MigrationInterface, QueryRunner } from "typeorm";

export class AddObjectIdToUsersTable1656475209371 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` ADD mongodb_id varchar(255) DEFAULT NULL;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN mongodb_id;');
  }
}
