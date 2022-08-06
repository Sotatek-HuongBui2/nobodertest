import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNetworkTokensTable1652092813789
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `network_tokens` (' +
        '`id` int(11) NOT NULL AUTO_INCREMENT,' +
        '`token_name` varchar(255) DEFAULT NULL,' +
        '`decimal` int(11) DEFAULT 18,' +
        '`network_id` int(11) DEFAULT NULL,' +
        '`contract_address` varchar(255) DEFAULT NULL,' +
        '`status` tinyint(4) DEFAULT 0,' +
        '`is_native_token` tinyint(4) DEFAULT 0,' +
        '`currency` varchar(255) DEFAULT NULL,' +
        '`icon` varchar(255) DEFAULT NULL,' +
        '`created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),' +
        'PRIMARY KEY (`id`),' +
        'KEY `FK_8573bsd2341s8965d9238412sss` (`network_id`),' +
        'CONSTRAINT `FK_8573bsd2341s8965d9238412sss` FOREIGN KEY (`network_id`) REFERENCES `networks` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `network_tokens`');
  }
}
