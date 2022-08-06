import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuctionSessionTable1652093171018
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `auction_session` (' +
        '`id` int(11) NOT NULL AUTO_INCREMENT,' +
        '`nft_id` int(11) NOT NULL,' +
        '`user_id` int(11) NOT NULL,' +
        '`highest_price` decimal(20,10) DEFAULT 0.0000000000,' +
        '`start_price` decimal(20,10) DEFAULT 0.0000000000,' +
        '`end_price` decimal(20,10) DEFAULT 0.0000000000,' +
        '`step_price` decimal(20,10) DEFAULT 0.0000000000,' +
        '`status` int(11) DEFAULT 0,' +
        '`session_id` int(11) DEFAULT 0,' +
        '`receive_token` varchar(20) DEFAULT NULL,' +
        '`start_time` datetime(6) DEFAULT NULL,' +
        '`end_time` datetime(6) DEFAULT NULL,' +
        '`created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),' +
        '`sc_auction_id` int(11) DEFAULT 0,' +
        '`tx_id` varchar(100) DEFAULT NULL,' +
        '`network_token_id` int(11) DEFAULT NULL,' +
        'PRIMARY KEY (`id`),' +
        'KEY `FK_26312a1e349013213134239294n` (`nft_id`),' +
        'KEY `FK_26312a1e34901vxgfjk3mdm1232` (`user_id`),' +
        'CONSTRAINT `FK_26312a1e349013213134239294n` FOREIGN KEY (`nft_id`) REFERENCES `nfts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,' +
        'CONSTRAINT `FK_26312a1e34901vxgfjk3mdm1232` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `auction_session`');
  }
}
