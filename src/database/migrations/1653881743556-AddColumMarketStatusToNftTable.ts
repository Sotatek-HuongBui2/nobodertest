import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumMarketStatusToNftTable1653881743556 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE `nfts` ADD `market_status` tinyint DEFAULT 0 AFTER `status`');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE `nfts` DROP COLUMN market_status');
    }
    

}
