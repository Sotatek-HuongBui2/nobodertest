import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnIsUpdateToWhitelistTable1654745951863 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `whitelist_user` ADD `is_update` tinyint DEFAULT 0 AFTER `status`');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `whitelist_user` DROP COLUMN is_update');
  }

}
