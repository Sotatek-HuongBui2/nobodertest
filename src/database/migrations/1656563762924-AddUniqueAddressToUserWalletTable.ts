import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueAddressToUserWalletTable1656563762924 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user-wallet` MODIFY COLUMN address VARCHAR(255);');
    await queryRunner.query('ALTER TABLE `user-wallet` ADD CONSTRAINT unique_address UNIQUE (address);');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user-wallet` DROP INDEX address_unique;');
  }
}
