import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExternalTransactionTable1652092684085
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `external_transaction` (' +
        '`id` int(11) NOT NULL AUTO_INCREMENT,' +
        '`tx_hash` varchar(250) NOT NULL,' +
        '`action` int(11) DEFAULT 0,' +
        '`status` int(11) DEFAULT 0,' +
        '`address` varchar(250) DEFAULT NULL,' +
        '`created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),' +
        '`network_id` int(11) DEFAULT NULL,' +
        'PRIMARY KEY (`id`,`tx_hash`),' +
        'KEY `FK_0992639o12ydhkdnjsg271o3jms` (`network_id`),' +
        'CONSTRAINT `FK_0992639o12ydhkdnjsg271o3jms` FOREIGN KEY (`network_id`) REFERENCES `networks` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `external_transaction`');
  }
}
