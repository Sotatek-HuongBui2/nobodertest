import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumnTypeColumnsInNftsTable1656923634510 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `nfts` MODIFY COLUMN small_image text;');
    await queryRunner.query('ALTER TABLE `nfts` MODIFY COLUMN large_image text;');
    await queryRunner.query('ALTER TABLE `nfts` MODIFY COLUMN ipfs_json text;');
    await queryRunner.query('ALTER TABLE `nfts` MODIFY COLUMN origin_image text;');
    await queryRunner.query('ALTER TABLE `nfts` MODIFY COLUMN preview_image text;');
    await queryRunner.query('ALTER TABLE `nfts` MODIFY COLUMN full_image text;');
    await queryRunner.query('ALTER TABLE `nfts` MODIFY COLUMN token_id varchar(255);');
    await queryRunner.query('ALTER TABLE `nfts` MODIFY COLUMN hash_transaction varchar(255);');
    await queryRunner.query('ALTER TABLE `nfts` ADD COLUMN is_migrated tinyint DEFAULT 0;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
