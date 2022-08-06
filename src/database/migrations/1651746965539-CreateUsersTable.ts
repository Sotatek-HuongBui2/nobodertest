import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateUsersTable1651746965539 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("CREATE TABLE `users` (" +
        "`id` int(11) NOT NULL AUTO_INCREMENT, " +
        "`user_name` varchar(255) NOT NULL, " +
        "`password` varchar(255) DEFAULT NULL, " +
        "`email` varchar(255) NOT NULL, " +
        "`role` int(11) NOT NULL DEFAULT 1, " +
        "`email_verification_token` varchar(100) NULL, " +
        "`email_verified` tinyint(4) DEFAULT 0, " +
        "`avatar` varchar(255) DEFAULT NULL, " +
        "`first_name` varchar(255) DEFAULT NULL, " +
        "`last_name` varchar(255) DEFAULT NULL, " +
        "`name` varchar(255) DEFAULT NULL, " +
        "`phone` varchar(255) DEFAULT NULL, " +
        "`about` longtext DEFAULT NULL, " +
        "`website` varchar(255) DEFAULT NULL, " +
        "`facebook_site` varchar(255) DEFAULT NULL, " +
        "`instagram_site` varchar(255) DEFAULT NULL, " +
        "`twitter_site` varchar(255) DEFAULT NULL, " +
        "`youtube_site` varchar(255) DEFAULT NULL, " +
        "`invite_code` varchar(255) DEFAULT NULL, " +
        "`following` int(11) DEFAULT 0, " +
        "`followers` int(11) DEFAULT 0, " +
        "`user_nft_role` int(11) DEFAULT 0, " +
        "`user_wallet_id` int(11) DEFAULT NULL, " +
        "`status` int(11) NOT NULL DEFAULT 0, " +
        "`created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6), " +
        "`updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6), " +
        "`forgot_password` varchar(255) DEFAULT NULL, " +
        "`last_login` datetime(6) DEFAULT NULL, " +
        "PRIMARY KEY (`id`), " +
        "UNIQUE KEY `REL_079c7986981b5a04424db075d0` (`user_wallet_id`), " +
        "CONSTRAINT `FK_079c7986981b5a04424db075d0a` FOREIGN KEY (`user_wallet_id`) REFERENCES `user-wallet` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION )" +
        "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; ");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE IF EXISTS `users`");
    }
}
