import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnMoralisTransactionsToNetworkTable1655102183978
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `networks` ADD `moralis_transactions` text DEFAULT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `networks` DROP COLUMN moralis_transactions',
    );
  }
}
