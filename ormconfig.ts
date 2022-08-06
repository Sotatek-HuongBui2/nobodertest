/**
 * this file will configure the setting of orm migration
 */

module.exports = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE_NAME,
  entities: ['dist/**/**/entities/*.entity{ .ts,.js}'],
  //subscribers: ['dist/**/*.subscriber{ .ts,.js}'],
  synchronize: false,
  migrations: ['dist/database/migrations/*.js'],
  factories: ['dist/database/factories/*.factory{.ts,.js}'],
  seeds: ['dist/database/seeders/*.seed{.ts,.js}'],
  cli: {
    entitiesDir: 'src',
    subscribersDir: 'src',
    migrationsDir: 'src/database/migrations',
  },
};
