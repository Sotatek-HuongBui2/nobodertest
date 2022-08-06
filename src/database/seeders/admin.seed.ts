import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { UserWallet } from 'src/modules/user-wallet/entities/user-wallet.entity';
import { userStatus } from 'src/modules/auth/enums';
import * as shortid from 'shortid';

export default class AdminSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const userCreate = new User();
    userCreate.userName = 'Admin 01'
    userCreate.email = '';
    userCreate.role = 2
    userCreate.inviteCode = shortid.generate();
    userCreate.userWallet = new UserWallet();
    userCreate.status = userStatus.ACTIVE;
    userCreate.userWallet.address = '0x95c176E66b035E3cF7C6F486960ffd7708d3411c'
    userCreate.userWallet.type = 1
    await userCreate.save()
  }
}
