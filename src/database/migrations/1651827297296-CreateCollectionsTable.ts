import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCollectionsTable1651827297296 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `collections` ( " +
            "`id` int(11) NOT NULL AUTO_INCREMENT, " +
            "`name` varchar(255) DEFAULT NULL, " +
            "`description` longtext DEFAULT NULL, " +
            "`symbol` varchar(50) DEFAULT NULL," +
            "`type` int(11) NOT NULL DEFAULT 0," +
            "`banner_image` longtext DEFAULT NULL, " +
            "`icon_image` longtext DEFAULT NULL, " +
            "`contract_address` varchar(255) DEFAULT NULL, " +
            "`status` int(11) DEFAULT 0," +
            "`hash_transaction` varchar(255) DEFAULT NULL," +
            "`network_id` int(11) DEFAULT NULL, " +
            "`user_id` int(11) DEFAULT 0, " +
            "`created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6)," +
            "`updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6)," +
            "PRIMARY KEY (`id`), " +
            "KEY `FK_da613d6625365707f8df0f65d81` (`user_id`), " +
            "KEY `FK_dkjsdkjhsdlkj228127192212ss` (`network_id`), " +
            "CONSTRAINT `FK_da613d6625365707f8df0f65d81` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION, " +
            "CONSTRAINT `FK_dkjsdkjhsdlkj228127192212ss` FOREIGN KEY (`network_id`) REFERENCES `networks` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION )" +
            "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE IF EXISTS `collections`");
    }

}
