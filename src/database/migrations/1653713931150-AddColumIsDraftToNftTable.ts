import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumIsDraftToNftTable1653713931150 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE `nfts` ADD `is_draft` tinyint DEFAULT 1 AFTER `name`');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE `nfts` DROP COLUMN is_draft');
    }

}
