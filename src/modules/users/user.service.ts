import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { userStatus } from 'src/modules/auth/enums';
import { CreateExternalWalletUserDto } from './dto/create-user-external-wallet.dto';
import {
  recoverSignature,
  signMessage,
} from 'src/common/utility/recoverSignature';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import * as shortid from 'shortid';
import { UserWallet } from '../user-wallet/entities/user-wallet.entity';
import { CollectionsService } from '../collections/collections.service';
import { WhitelistUserService } from '../whitelist-user/whitelist-user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ArtistService } from '../artist/artist.service';
import { IsNonCrypto, userType, UserVerify } from './enums';
import { GetDetailUserDto } from './dto/get-detail-user.dto';
import { JWTPayload } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { RequestArtistDto } from './dto/request-artist.dto';
import { CollectionsRepository } from '../collections/collections.repository';
import { NftsRepository } from '../nfts/nfts.repository';
import SOCKET_EVENT, { sendToSocket } from 'src/common/utility/socket';
import { CollectionStatus } from '../collections/enums';
import { UpdateImageDto } from './dto/update-image.dto';
import { StatusArtists } from '../artist/enum';
import { NFT_CATEGORIES } from '../nfts/enums';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly collectionsService: CollectionsService,
    private readonly whitelistUserService: WhitelistUserService,
    private readonly artistService: ArtistService,
    private readonly collectionRepository: CollectionsRepository,
    private readonly nftRepository: NftsRepository,
    private jwtService: JwtService,
  ) { }

  async getRepository() {
    return this.userRepository;
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findUser(id: number) {
    return this.userRepository.findByIds([id]);
  }

  async findUserByAddress(address: string) {
    return this.userRepository.findOne({
      relations: ['userWallet'],
      where: {
        userWallet: {
          address: address?.toLowerCase(),
        },
      },
    });
  }

  async findInviteCode(inviteCode: string) {
    return this.userRepository.findOne({
      inviteCode,
      status: userStatus.ACTIVE,
    });
  }

  async signMessage(privateKey: string, message: string) {
    return await signMessage(privateKey, message);
  }

  async registerExternalWallet(createUserDto: CreateExternalWalletUserDto) {
    const recoverAddress = await recoverSignature(
      createUserDto.signature,
      createUserDto.type,
      -1,
    );

    if (
      recoverAddress?.toLowerCase() !== createUserDto.address?.toLowerCase()
    ) {
      throw new BadRequestException(
        CustomErrorMessage['USER.SIGNATURE_RECOVER_ADDRESS_NOT_MATCH'],
      );
    }
    const checkUserEmail = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (checkUserEmail) {
      throw new BadRequestException(
        CustomErrorMessage['USER.USER_WITH_EMAIL_ALREADY_EXIST'],
      );
    }
    const user = await this.saveNewUser(createUserDto);
    // await Promise.all([
    //   this.collectionsService.createWithXanalia721(user),
    // ]);
    return user;
  }

  async createNewUserWithAddress(address: string) {
    const userCreate = new User();
    userCreate.userName = "";
    userCreate.email = '';
    userCreate.inviteCode = shortid.generate();
    userCreate.userWallet = new UserWallet();
    userCreate.status = userStatus.ACTIVE;
    userCreate.userWallet.address = address;
    userCreate.userWallet.type = userType.VERIFIED;
    userCreate.avatar = null;

    return await this.userRepository.save(userCreate);
  }

  async saveNewUser(createUserDto: CreateExternalWalletUserDto) {
    const userCreate = new User();
    userCreate.userName = createUserDto.userName;
    userCreate.email = createUserDto.email || '';
    userCreate.inviteCode = shortid.generate();
    userCreate.userWallet = new UserWallet();
    userCreate.status = userStatus.ACTIVE;
    userCreate.userWallet.address = createUserDto.address.toLowerCase();
    userCreate.userWallet.type = createUserDto.type;
    userCreate.avatar = null;
    if (userCreate.email) {
      userCreate.isNonCrypto = IsNonCrypto.TRUE;
      userCreate.emailVerified = UserVerify.TRUE;
    }
    return await this.userRepository.save(userCreate);
  }

  async requestWhitelist(networkId: number, user: User) {
    return this.whitelistUserService.requestWhitelist(networkId, user);
  }

  async requestArtist(user: User, requestArtistDto: RequestArtistDto) {
    return this.artistService.requestArtist(user, requestArtistDto);
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, user: User) {
    const id = user.id;
    if (updateProfileDto.email) {
      const checkUserEmail = await this.userRepository.findByEmail(
        updateProfileDto.email.toLowerCase(),
      );
      if (checkUserEmail) {
        if (checkUserEmail.id != id) {
          throw new BadRequestException(
            CustomErrorMessage['USER.USER_WITH_EMAIL_ALREADY_EXIST'],
          );
        }
      } else {
        updateProfileDto['emailVerified'] = UserVerify.FALSE;
      }
      updateProfileDto.email = updateProfileDto.email.toLowerCase();
    }

    if (updateProfileDto.twitterSite) {
      const checkTwitter = await this.userRepository.findOne({
        twitterSite: updateProfileDto.twitterSite,
      });
      if (checkTwitter) {
        if (checkTwitter.id !== id) {
          throw new BadRequestException(
            CustomErrorMessage['USER.USER_WITH_TWITTER_ALREADY_EXIST'],
          );
        }
      } else {
        updateProfileDto['twitterVerified'] = UserVerify.FALSE;
      }
    } else if (!updateProfileDto.twitterSite) {
      // If user enter empty twitter account then I will reset twitterVerified
      updateProfileDto['twitterVerified'] = UserVerify.FALSE;
    }

    if (updateProfileDto.userName) {
      const checkUserName = await this.userRepository.findOne({
        userName: updateProfileDto.userName,
      });
      if (checkUserName && checkUserName.id !== id) {
        throw new BadRequestException(
          CustomErrorMessage['USER.USER_ALREADY EXISTS'],
        );
      }
    }
    return await this.userRepository.update(id, updateProfileDto);
  }

  async getAllUser() {
    return this.userRepository.find();
  }

  async getUserDetail(getDetailUserDto: GetDetailUserDto) {
    let user = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.userWallet', 'userWallet')
      .where('(userWallet.address = :address or users.userName = :address)', {
        address: getDetailUserDto.address,
      })
      .getOne();

    if (!user) {
      throw new BadRequestException(CustomErrorMessage['USER.USER_NOT_FOUND']);
    }
    return user;
  }

  async createJwt(user: User) {
    const { id, userName } = user;
    const walletType = user?.userWallet?.type;
    const payload: JWTPayload = {
      sub: id,
      username: userName,
      walletType: walletType,
      nonce: user?.userWallet?.nonce,
    };
    return this.jwtService.sign(payload);
  }

  async updateVerifyEmail(accessToken) {
    try {
      const data = this.jwtService.verify(accessToken);
      return await this.userRepository.update(data.sub, {
        emailVerified: UserVerify.TRUE,
      });
    } catch (error) {
      throw new BadRequestException(
        CustomErrorMessage['USER.SIGNATURE_RECOVER_ADDRESS_NOT_MATCH'],
      );
    }
  }

  async updateImage(updateDto: UpdateImageDto, user: User) {
    console.log('updateDto:', updateDto);

    let updateData = {};
    const socketData = {
      fromUser: user.userWallet.address,
      toUser: user.userWallet.address,
      status: true,
    };
    let eventName = '';
    if (updateDto.banner) {
      const value = updateDto.banner === '-1' ? null : process.env.PUBLIC_IMAGE_URL_PREFIX + updateDto.banner;
      updateData['banner'] = value;
      socketData['banner'] = value;
      eventName = SOCKET_EVENT.USER_UPDATE_BANNER;
    }
    if (updateDto.avatar) {
      const value = updateDto.avatar === '-1' ? null : process.env.PUBLIC_IMAGE_URL_PREFIX + updateDto.avatar;
      updateData['avatar'] = value;
      socketData['avatar'] = value;
      eventName = SOCKET_EVENT.USER_UPDATE_AVATAR;
    }
    await this.userRepository.update(user.id, updateData);
    sendToSocket(socketData, eventName);
    return { message: "Update success", status_code: 200 };
  }

  async searchData(keyword: string) {
    const searchArtistQuery = this.userRepository
      .createQueryBuilder('users')
      .select([
        'users.avatar as avatar',
        'users.userName as name',
        'userWallet.address as address',
      ])
      .where('users.userName like :name', { name: `%${keyword}%` })
      .leftJoin('artists', 'artists', 'users.id = artists.user_id')
      .leftJoin(
        'user-wallet',
        'userWallet',
        'userWallet.id = users.user_wallet_id',
      )
      .andWhere('artists.user_id = users.id')
      .andWhere('artists.status = :status', { status: StatusArtists.APPROVED })
      .limit(5)
      .getRawMany();

    const searchCollectionQuery = this.collectionRepository
      .createQueryBuilder('collections')
      .select([
        'collections.bannerImage as bannerImage',
        'collections.iconImage as iconImage',
        'collections.name as name',
        'collections.contractAddress as address',
        'networks.name as network',
      ])
      .leftJoin('networks', 'networks', 'networks.id = collections.network_id')
      .where('collections.name like :name', { name: `%${keyword}%` })
      .andWhere(`collections.status = ${CollectionStatus.DONE}`)
      .limit(5)
      .getRawMany();

    const searchNftQuery = this.nftRepository
      .createQueryBuilder('nfts')
      .select([
        `CASE WHEN nfts.category IN (${NFT_CATEGORIES.VIDEO}, ${NFT_CATEGORIES.AUDIO}) THEN nfts.preview_image ELSE nfts.small_image END as smallImage `,
        'nfts.large_image as largeImage',
        'nfts.name as name',
        'nfts.tokenId as tokenId',
        'collections.contractAddress as collectionAddress',
        'networks.name as network',
      ])
      .where('nfts.name like :name', { name: `%${keyword}%` })
      .andWhere('nfts.isDraft = 0')
      .leftJoin('networks', 'networks', 'networks.id = nfts.network_id')
      .leftJoin(
        'collections',
        'collections',
        'nfts.collections_id = collections.id',
      )
      .limit(5)
      .getRawMany();

    const [artistSearch, collectionSearch, nftSearch] = await Promise.all([
      searchArtistQuery,
      searchCollectionQuery,
      searchNftQuery,
    ]);
    return { artistSearch, collectionSearch, nftSearch };
  }

  async disconnnectTwitter(user: User) {
    return await this.userRepository.update(user.id, {
      twitterSite: null,
      twitterVerified: UserVerify.FALSE,
    });
  }

  async updateNewWalletUser(user: User, address: string) {
    user.userWallet = new UserWallet()
    user.userWallet.address = address.toLowerCase()
    user.userWallet.type = 1
    user.status = userStatus.ACTIVE
    user.emailVerified = 1
    await this.userRepository.save(user)
    return user
  }
}
