import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserLikeNftTable1654674872189 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TABLE `user_like_nft` ( " +
      "`id` int(11) NOT NULL AUTO_INCREMENT, " +
      "`nft_id` int(11) NOT NULL, " +
      "`user_id` int(11) NOT NULL, " +
      "`status` int(11) NOT NULL DEFAULT 0, " +
      "PRIMARY KEY (`id`) " +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    await queryRunner.query('ALTER TABLE `user_like_nft` ADD INDEX `fk_user_id_idx` (`user_id` ASC)');

    await queryRunner.query('ALTER TABLE `user_like_nft` ADD INDEX `fk_nft_id_idx` (`nft_id` ASC)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS `user_like_nft`");
  }

}
