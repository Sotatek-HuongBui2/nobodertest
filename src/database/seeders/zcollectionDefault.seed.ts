import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { userStatus } from 'src/modules/auth/enums';
import { Collection } from 'src/modules/collections/entities/collections.entity';
import { collectionType } from 'src/modules/collections/enums';

export default class CollectionDefault implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const userCreate = new User();
    userCreate.userName = 'Xanalia'
    userCreate.email = '';
    userCreate.status = userStatus.ACTIVE;
    const userDefault = await userCreate.save()

    const bannerImage = "https://storage.xanalia.com/icon/default_banner_collection.jpg";
    const iconImage = "https://storage.xanalia.com/output/user-avatar/40/1655865316561.png";
    await connection
      .createQueryBuilder()
      .insert()
      .into(Collection)
      .values([
        {
          name: 'Xanalia Ethereum',
          description: 'Xanalia721 collection',
          userId: userDefault.id,
          bannerImage: bannerImage,
          iconImage: iconImage,
          status: 1,
          networkId: 1,
          contractAddress: '0x110787be11117c8d46e72b817ef6f57157336c5c',
          type: collectionType.default
        },
        {
          name: 'Xanalia Polygon',
          description: 'Xanalia721 collection',
          bannerImage: bannerImage,
          iconImage: iconImage,
          status: 1,
          networkId: 2,
          contractAddress: '0x110787be11117c8d46e72b817ef6f57157336c5c',
          userId: userDefault.id,
          type: collectionType.default
        },
        {
          name: 'Xanalia BSC',
          description: 'Xanalia721 collection',
          userId: userDefault.id,
          bannerImage: bannerImage,
          iconImage: iconImage,
          status: 1,
          networkId: 3,
          contractAddress: '0x110787be11117c8d46e72b817ef6f57157336c5c',
          type: collectionType.default
        },
      ])
      .execute();
  }
}
