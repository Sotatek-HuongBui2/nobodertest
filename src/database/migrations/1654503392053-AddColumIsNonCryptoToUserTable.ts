import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumIsNonCryptoToUserTable1654503392053 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `users` ADD `is_non_crypto` tinyint DEFAULT 0 AFTER `status`');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `users` DROP COLUMN is_non_crypto');
    }

}
