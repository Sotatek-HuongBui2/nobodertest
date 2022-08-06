import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSaleNftsTable1652093564597 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `sale_nft` (' +
        '`id` int(11) NOT NULL AUTO_INCREMENT,' +
        '`nft_id` int(11) NOT NULL,' +
        '`from_user_id` int(11) NOT NULL,' +
        '`to_user_id` int(11) NOT NULL,' +
        '`price` decimal(16,6) DEFAULT NULL,' +
        '`quantity` int(11) DEFAULT 0,' +
        '`pending_quantity` int(11) DEFAULT 0,' +
        '`success_quantity` int(11) DEFAULT 0,' +
        '`action` int(11) DEFAULT 0,' +
        '`receive_token` varchar(20) DEFAULT NULL,' +
        '`status` int(11) DEFAULT 0,' +
        '`expired` int(15) DEFAULT 0,' +
        '`raw_transaction_id` int(11) DEFAULT 0,' +
        '`order_id` int(11) DEFAULT 0,' +
        '`created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),' +
        '`tx_id` varchar(100) DEFAULT NULL,' +
        "`influencer` varchar(50) DEFAULT '0x0000000000000000000000000000000000000000'," +
        '`influencer_fee` int(11) NOT NULL DEFAULT 0,' +
        '`original_price` decimal(16,6) DEFAULT NULL,' +
        '`auction_session_id` int(11) DEFAULT NULL,' +
        '`network_token_id` int(11) DEFAULT NULL,' +
        '`bid_id` int(11) DEFAULT 0,' +
        '`parent_id` int(11) DEFAULT NULL,' +
        'PRIMARY KEY (`id`),' +
        'KEY `FK_26312a1e3490132131342352344` (`nft_id`),' +
        'KEY `FK_26312a1e34901011fc62198277a` (`from_user_id`),' +
        'KEY `FK_26312a1e349010119qwuokwn212` (`to_user_id`),' +
        'KEY `FK_da659797ho2szzakl89e719553d` (`auction_session_id`),' +
        'KEY `FK_893ijsaklj287yehndlakj2oi7` (`network_token_id`),' +
        'KEY `FK_8912345678lkjhgsdf23` (`parent_id`),' +
        'CONSTRAINT `FK_26312a1e349010119qwuokwn212` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,' +
        'CONSTRAINT `FK_26312a1e34901011fc62198277a` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,' +
        'CONSTRAINT `FK_26312a1e3490132131342352344` FOREIGN KEY (`nft_id`) REFERENCES `nfts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,' +
        'CONSTRAINT `FK_8912345678lkjhgsdf23` FOREIGN KEY (`parent_id`) REFERENCES `sale_nft` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,' +
        'CONSTRAINT `FK_893ijsaklj287yehndlakj2oi7` FOREIGN KEY (`network_token_id`) REFERENCES `network_tokens` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,' +
        'CONSTRAINT `FK_da659797ho2szzakl89e719553d` FOREIGN KEY (`auction_session_id`) REFERENCES `auction_session` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `sale_nft`');
  }
}
