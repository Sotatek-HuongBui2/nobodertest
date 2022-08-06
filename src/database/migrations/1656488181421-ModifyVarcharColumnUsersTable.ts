import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyVarcharColumnUsersTable1656488181421 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` MODIFY COLUMN about longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

  }
}
