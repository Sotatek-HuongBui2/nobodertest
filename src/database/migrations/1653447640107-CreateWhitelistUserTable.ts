import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWhitelistUserTable1653447640107 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TABLE `whitelist_user` (" +
      "`id` int(11) NOT NULL AUTO_INCREMENT, " +
      "`status` int(11) NOT NULL DEFAULT 0, " +
      "`user_id` int(11) DEFAULT NULL, " +
      "`network_id` int(11) DEFAULT NULL, " +
      "`created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6), " +
      "`updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6), " +
      "PRIMARY KEY (`id`), " +
      'CONSTRAINT `FK_8573bsd2341s8965d9238071221` FOREIGN KEY (`network_id`) REFERENCES `networks` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION, ' +
      "CONSTRAINT `FK_079c7986981b5a04424db241121` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION )" +
      "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; ");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS `whitelist-user`");
  }

}
