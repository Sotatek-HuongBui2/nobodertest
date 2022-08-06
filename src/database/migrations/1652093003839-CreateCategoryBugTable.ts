import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoryBugTable1652093003839 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `category_bug` (' +
        '`id` int(11) NOT NULL AUTO_INCREMENT,' +
        '`name` varchar(255) DEFAULT NULL,' +
        '`status` int(11) NOT NULL DEFAULT 1,' +
        '`created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),' +
        '`updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `category_bug`');
  }
}
