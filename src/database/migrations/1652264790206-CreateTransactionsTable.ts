import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionsTable1652264790206
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `transactions` (' +
        '`id` int(11) NOT NULL AUTO_INCREMENT,' +
        '`address` longtext DEFAULT NULL,' +
        '`sign_transaction` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`sign_transaction`)),' +
        '`status` int(11) DEFAULT 1,' +
        '`retry_count` int(11) NOT NULL DEFAULT 0,' +
        '`created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),' +
        ' `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),' +
        '`user_id` int(11) DEFAULT NULL,' +
        '`amount` decimal(10,2) NOT NULL DEFAULT 0.00,' +
        ' `type` int(11) NOT NULL DEFAULT 1,' +
        '`transaction_hash` longtext NOT NULL,' +
        '`is_done` int(11) NOT NULL DEFAULT 0,' +
        '`nfts_id` int(11) DEFAULT NULL,' +
        'PRIMARY KEY (`id`),' +
        'KEY `FK_6bb58f2b6e30cb51a6504599f41` (`user_id`),' +
        'CONSTRAINT `FK_6bb58f2b6e30cb51a6504599f41` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `transactions`');
  }
}
