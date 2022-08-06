import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnIsHotToCollectionsTable1657793077993 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `collections` ADD is_hot TINYINT DEFAULT 0;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `collections` DROP COLUMN is_hot;');
  }
}
