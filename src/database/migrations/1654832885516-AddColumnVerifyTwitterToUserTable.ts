import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnVerifyTwitterToUserTable1654832885516 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `users` ADD `twitter_verified` tinyint DEFAULT 0 AFTER `email_verified`');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `users` DROP COLUMN twitter_verified');
    }

}
