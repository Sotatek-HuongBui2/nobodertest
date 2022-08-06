import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterColumnTypeCollection1655895045539 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `collections` MODIFY COLUMN name longtext;');
        await queryRunner.query('ALTER TABLE `collections` MODIFY COLUMN symbol longtext;');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `collections` MODIFY COLUMN name varchar(255);');
        await queryRunner.query('ALTER TABLE `collections` MODIFY COLUMN symbol varchar(255);');
    }

}
