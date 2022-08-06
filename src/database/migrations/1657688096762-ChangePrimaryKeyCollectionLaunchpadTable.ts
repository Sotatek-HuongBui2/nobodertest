import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePrimaryKeyCollectionLaunchpadTable1657688096762 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `collection_launchpad` MODIFY collection_id INT;');
    await queryRunner.query('ALTER TABLE `collection_launchpad` DROP collection_id, ADD `id` INT PRIMARY KEY AUTO_INCREMENT FIRST;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('');
  }
}
