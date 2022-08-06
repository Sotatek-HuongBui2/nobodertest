import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnDiscordAndZommToUserTable1653616952859 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` ADD `zoom_mail` varchar(255) DEFAULT NULL, ADD `discord_site` varchar(255) DEFAULT NULL;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN zoom_mail, DROP COLUMN discord_site;');
  }

}
