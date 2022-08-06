import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeColumnTypeOfColumnRoyaltyInNftsTable1655280888778 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `nfts` MODIFY COLUMN royalty DOUBLE;');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `nfts` MODIFY COLUMN royalty INT;');
    }

}
