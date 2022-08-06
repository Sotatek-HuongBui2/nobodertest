import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNetworkTable1651827297295 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `networks` ( ' +
        '`id` int(11) NOT NULL AUTO_INCREMENT, ' +
        '`name` longtext DEFAULT NULL, ' +
        '`chain_id` int(11) DEFAULT 0, ' +
        '`market_contract` varchar(255) DEFAULT NULL, ' +
        '`xanalia1155_general_contract` varchar(255) DEFAULT NULL, ' +
        '`xanalia721_general_contract` varchar(255) DEFAULT NULL, ' +
        '`xanalia_dex_contract` varchar(255) DEFAULT NULL, ' +
        '`xanalia_uri_contract` varchar(255) DEFAULT NULL, ' +
        '`xanalia_treasury_contract` varchar(255) DEFAULT NULL, ' +
        '`auction_contract` varchar(255) DEFAULT NULL, ' +
        '`rpc` varchar(255) DEFAULT NULL, ' +
        '`image` longtext DEFAULT NULL, ' +
        '`gas_limit` int(11) DEFAULT 0, ' +
        '`gas_limit_collection` int(11) DEFAULT 0, ' +
        "`gas_price` varchar(10) DEFAULT '2e10', " +
        '`status` tinyint(4) DEFAULT 0, ' +
        '`created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6), ' +
        'PRIMARY KEY (`id`))' +
        'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `networks`');
  }
}
