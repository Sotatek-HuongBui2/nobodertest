import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateCategoryTable1652092969946 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          'CREATE TABLE `category` (' +
            '`id` int(11) NOT NULL AUTO_INCREMENT,' +
            '`name` varchar(255) DEFAULT NULL,' +
            '`created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),' +
            '`updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),' +
            "`icon` varchar(255) DEFAULT NULL COMMENT 'uri icon photo for category'," +
            'PRIMARY KEY (`id`)' +
            ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS `category`');
      }
}
