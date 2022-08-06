import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumOfferDexContractInNftTable1654499740160 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE `networks` ADD `offer_dex_contract` varchar(255) DEFAULT NULL AFTER `xanalia_dex_contract`');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE `networks` DROP COLUMN offer_dex_contract');
    }
}
