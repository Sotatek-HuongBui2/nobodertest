import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnCategoryToNftTable1653364352555
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `nfts` ADD `category` int DEFAULT 1;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `nfts` DROP COLUMN category;');
  }
}
