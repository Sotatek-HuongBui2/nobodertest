import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnIsBlindBoxToCollectionTable1657513012266 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `collections` ADD is_blindbox TINYINT DEFAULT 0;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `collections` DROP COLUMN is_blindbox;');
  }
}
