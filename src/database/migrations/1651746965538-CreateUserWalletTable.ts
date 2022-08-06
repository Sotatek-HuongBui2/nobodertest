import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserWalletTable1651746965538 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TABLE `user-wallet` ( " +
      "`id` int(11) NOT NULL AUTO_INCREMENT, " +
      "`address` longtext DEFAULT NULL, " +
      "`type` tinyint(4) DEFAULT 0, " +
      "`nonce` int(15) NOT NULL DEFAULT 0, " +
      "`private_key_encrypted_value` longtext DEFAULT NULL, " +
      "`private_key_encryption_key` longtext DEFAULT NULL, " +
      "`private_key_encryption_algorithm` longtext DEFAULT NULL, " +
      "PRIMARY KEY (`id`) " +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS `user-wallet`");
  }
}
