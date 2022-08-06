import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnDescriptionAndBannerToUserTable1654944870679 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `users` ADD `description` text DEFAULT NULL, ADD `banner` varchar(255) DEFAULT NULL;');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `users` DROP COLUMN description, DROP COLUMN banner;');
    }

}
