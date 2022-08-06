import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCollectionLaunchpadTable1657610661822 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TABLE `collection_launchpad` ( " +
      "`collection_id` int(11) NOT NULL, " +
      "`creator_name` text DEFAULT NULL, " +
      "`creator_description` text DEFAULT NULL, " +
      "`thumbnail_image` text DEFAULT NULL, " +
      "PRIMARY KEY (`collection_id`) " +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS `collection_launchpad`;");
  }
}
