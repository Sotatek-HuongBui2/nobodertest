import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoryNftsTable1652093031526
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `category_nfts` (' +
        '`category_id` int(11) NOT NULL,' +
        '`nfts_id` int(11) NOT NULL,' +
        'PRIMARY KEY (`category_id`,`nfts_id`),' +
        'KEY `IDX_9be1d166c6fd23a98af614188b` (`category_id`),' +
        'KEY `IDX_e33c74ef7e084d609d1af558e0` (`nfts_id`),' +
        'CONSTRAINT `FK_9be1d166c6fd23a98af614188b9` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,' +
        'CONSTRAINT `FK_e33c74ef7e084d609d1af558e02` FOREIGN KEY (`nfts_id`) REFERENCES `nfts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `category_nfts`');
  }
}
