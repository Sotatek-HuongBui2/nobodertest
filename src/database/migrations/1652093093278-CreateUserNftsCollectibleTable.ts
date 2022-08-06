import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserNftsCollectibleTable1652093093278
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `user_nfts_collectible` (' +
        '`user_id` int(11) NOT NULL,' +
        '`nft_id` int(11) NOT NULL,' +
        '`number` int(11) NOT NULL DEFAULT 0,' +
        '`created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),' +
        '`updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),' +
        '`type` int(11) NOT NULL DEFAULT 1,' +
        '`amount` decimal(10,2) NOT NULL DEFAULT 0.00,' +
        '`status` int(11) NOT NULL DEFAULT 1,' +
        'PRIMARY KEY (`user_id`,`nft_id`),' +
        'KEY `FK_5764f7a1bdc34a7a280214ce656` (`nft_id`),' +
        'CONSTRAINT `FK_5764f7a1bdc34a7a280214ce656` FOREIGN KEY (`nft_id`) REFERENCES `nfts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,' +
        'CONSTRAINT `FK_6770a0296a281aecca1f10d05b9` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `user_nfts_collectible`');
  }
}
