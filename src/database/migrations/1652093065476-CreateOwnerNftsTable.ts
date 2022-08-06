import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOwnerNftsTable1652093065476 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `owner_nft` (' +
        '`id` int(11) NOT NULL AUTO_INCREMENT,' +
        '`sale_total` int(11) DEFAULT 0,' +
        '`farm_total` int(11) DEFAULT 0,' +
        '`user_id` int(11) DEFAULT NULL,' +
        '`nfts_id` int(11) DEFAULT NULL,' +
        'PRIMARY KEY (`id`),' +
        'UNIQUE KEY `IDX_2ed1dea8bcea8780092a7bac75` (`user_id`,`nfts_id`),' +
        'KEY `FK_b6e4605164c5e3916d147d55fe5` (`nfts_id`),' +
        'CONSTRAINT `FK_219645d2c23d68effc32afe18fb` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,' +
        'CONSTRAINT `FK_b6e4605164c5e3916d147d55fe5` FOREIGN KEY (`nfts_id`) REFERENCES `nfts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `owner_nft`');
  }
}
