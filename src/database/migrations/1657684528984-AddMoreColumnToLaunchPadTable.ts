import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMoreColumnToLaunchPadTable1657684528984 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `collection_launchpad` ADD icon_image text DEFAULT NULL;');
    await queryRunner.query('ALTER TABLE `collection_launchpad` ADD banner_image text DEFAULT NULL;');
    await queryRunner.query('ALTER TABLE `collection_launchpad` ADD name text DEFAULT NULL;');
    await queryRunner.query('ALTER TABLE `collection_launchpad` ADD description text DEFAULT NULL;');
    await queryRunner.query('ALTER TABLE `collection_launchpad` ADD chain varchar(225) DEFAULT NULL;');
    await queryRunner.query('ALTER TABLE `collection_launchpad` ADD status tinyint DEFAULT 1;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `collection_launchpad` DROP COLUMN icon_image;');
    await queryRunner.query('ALTER TABLE `collection_launchpad` DROP COLUMN banner_image;');
    await queryRunner.query('ALTER TABLE `collection_launchpad` DROP COLUMN name;');
    await queryRunner.query('ALTER TABLE `collection_launchpad` DROP COLUMN description;');
    await queryRunner.query('ALTER TABLE `collection_launchpad` DROP COLUMN chain;');
    await queryRunner.query('ALTER TABLE `collection_launchpad` DROP COLUMN status;');
  }
}
