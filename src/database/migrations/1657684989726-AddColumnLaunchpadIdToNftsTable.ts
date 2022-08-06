import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnLaunchpadIdToNftsTable1657684989726 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `nfts` ADD launchpad_id INT DEFAULT NULL;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `nfts` DROP COLUMN launchpad_id;');
  }
}
