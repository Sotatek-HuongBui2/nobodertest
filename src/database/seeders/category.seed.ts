import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Category } from 'src/modules/categories/entities/category.entity';

export default class CategorySeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Category)
      .values([
        {
          id: 1,
          name: 'art',
        },
        {
          id: 2,
          name: 'image',
        },
        {
          id: 3,
          name: 'gif',
        },
        {
          id: 4,
          name: 'movie',
        },
        {
          id: 5,
          name: 'music',
        },
      ])
      .execute();
  }
}
