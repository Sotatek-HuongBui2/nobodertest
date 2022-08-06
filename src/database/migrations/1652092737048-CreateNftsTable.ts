import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNftsTable1652092737048 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `nfts` (' +
        '`id` int(11) NOT NULL AUTO_INCREMENT,' +
        '`name` varchar(255) DEFAULT NULL,' +
        '`description` longtext DEFAULT NULL,' +
        '`royalty` int(11) DEFAULT 0,' +
        '`no_copy` int(11) DEFAULT 0,' +
        '`small_image` varchar(255) DEFAULT NULL,' +
        '`large_image` varchar(255) DEFAULT NULL,' +
        '`ipfs_json` varchar(255) DEFAULT NULL,' +
        '`created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),' +
        '`updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),' +
        '`user_id` int(11) DEFAULT NULL,' +
        '`origin_image` varchar(255) DEFAULT NULL,' +
        '`collections_id` int(11) DEFAULT NULL,' +
        '`market` int(11) DEFAULT 0,' +
        '`status` int(11) NOT NULL DEFAULT 0,' +
        '`quantity` int(11) DEFAULT 0,' +
        '`price` decimal(16,6) DEFAULT NULL,' +
        '`raw_transaction` longtext DEFAULT NULL,' +
        '`token_id` longtext DEFAULT NULL,' +
        '`type` int(11) NOT NULL DEFAULT 0,' +
        '`on_farm_status` int(11) NOT NULL DEFAULT 0,' +
        '`on_sale_status` int(11) NOT NULL DEFAULT 0,' +
        '`hash_transaction` longtext DEFAULT NULL,' +
        '`pumpkin` int(11) DEFAULT 0,' +
        '`file_extension` varchar(255) DEFAULT NULL,' +
        '`preview_image` varchar(255) DEFAULT NULL,' +
        '`full_image` varchar(255) DEFAULT NULL,' +
        "`standard_type` int(11) NOT NULL DEFAULT 0 COMMENT '0 is xanalia1155, 1 is erc721'," +
        "`is_feature` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1 is feature home page'," +
        '`unlockable_content` varchar(1000) DEFAULT NULL,' +
        '`receive_token` varchar(20) DEFAULT NULL,' +
        '`platform_commission` decimal(4,2) NOT NULL DEFAULT 2.50,' +
        '`network_id` int(11) DEFAULT NULL,' +
        '`is_auction` int(11) DEFAULT 0,' +
        '`auction_receive_token` varchar(50) DEFAULT NULL,' +
        '`min_start_price` decimal(20,10) DEFAULT 0.0000000000,' +
        'PRIMARY KEY (`id`),' +
        'KEY `FK_aaf2a9cd8392258b38fcf049a7f` (`user_id`),' +
        'KEY `FK_b75358b68538a08acb475715501` (`collections_id`),' +
        'KEY `FK_857kdjkdsdmdm2uyo31348dkdda` (`network_id`),' +
        'CONSTRAINT `FK_857kdjkdsdmdm2uyo31348dkdda` FOREIGN KEY (`network_id`) REFERENCES `networks` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,' +
        'CONSTRAINT `FK_aaf2a9cd8392258b38fcf049a7f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,' +
        'CONSTRAINT `FK_b75358b68538a08acb475715501` FOREIGN KEY (`collections_id`) REFERENCES `collections` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `nfts`');
  }
}
