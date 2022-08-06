import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomErrorMessage } from 'src/common/constants/error-message';
import { Role } from 'src/common/decorators/roles.decorator';
import { ArtistRepository } from '../artist/artist.repository';
import { ArtistService } from '../artist/artist.service';
import { StatusArtists } from '../artist/enum';
import { UserRepository } from '../users/user.repository';
import { UserService } from '../users/user.service';
import { WhitelistUserRepository } from '../whitelist-user/whitelist-user.repository';
import { WhitelistUserService } from '../whitelist-user/whitelist-user.service';
import { ChangeStatusArtistDto } from './dto/change-status-artist.dto';
import { ChangeStatusWhitelistUserDto } from './dto/change-status-whitelist-user.dto';
import { ChangeStatusWhitelistArrayDto } from './dto/change-status-whitelist-array.dto';
import { GetListArtistDto } from './dto/get-list-artist';
import { GetListWhitelistDto } from './dto/get-list-whitelist.dto';
import { updateWhiteList } from '../whitelist-user/enum';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private whitelistUserService: WhitelistUserService,
    private whitelistRepository: WhitelistUserRepository,
    private artistService: ArtistService,
    private artistRepository: ArtistRepository,
  ) {}
  async approveAdmin(address: string) {
    const user = await this.userService.findUserByAddress(address);
    if (user) {
      user.role = Role.Admin;
      return await this.userRepository.save(user);
    } else {
      throw new BadRequestException(CustomErrorMessage['USER.USER_NOT_FOUND']);
    }
  }

  async getAllWhitelistUser(getListWhitelistDto: GetListWhitelistDto) {
    return this.whitelistUserService.getAllWhitelistUser(getListWhitelistDto);
  }

  async getAllArtist(getListArtistDto: GetListArtistDto) {
    return this.artistService.getAllArtist(getListArtistDto);
  }

  async changeStatusWhitelistUser(
    changeStatusWhitelistUserDto: ChangeStatusWhitelistUserDto,
  ) {
    const whitelist = await this.whitelistUserService.findOneWhitelistUser(
      changeStatusWhitelistUserDto.networkId,
      null,
      changeStatusWhitelistUserDto.address,
    );
    if (whitelist) {
      whitelist.status = changeStatusWhitelistUserDto.status;
      whitelist.isUpdate = updateWhiteList.FALSE;
      return this.whitelistRepository.save(whitelist);
    } else {
      throw new BadRequestException(
        CustomErrorMessage['WHITELIST_USER.NOT_FOUND'],
      );
    }
  }

  async changeStatusWhitelistUsers(
    changeStatusWhitelistArrayDto: ChangeStatusWhitelistArrayDto,
  ) {
    let listWhiteList = await this.whitelistRepository.find();
    const { ids } = changeStatusWhitelistArrayDto;
    let saveWhitelist = [];
    for (const id of ids) {
      let whitelist = listWhiteList.find((whitelist) => {
        return id == whitelist.id;
      });
      if (whitelist) {
        whitelist.isUpdate = updateWhiteList.TRUE;
        saveWhitelist.push(whitelist);
      } else {
        throw new BadRequestException(
          CustomErrorMessage['WHITELIST_USER.NOT_FOUND'],
        );
      }
    }
    return await this.whitelistRepository.save(saveWhitelist);
  }

  async changeStatusArtist(changeStatusArtistDto: ChangeStatusArtistDto) {
    const artist = await this.artistService.findOneArtist(
      null,
      changeStatusArtistDto.address,
    );
    if (artist) {
      const role =
        changeStatusArtistDto.status == StatusArtists.APPROVED
          ? Role.Artist
          : Role.User;
      await this.userRepository.update(artist.user.id, { role });
      return this.artistRepository.update(artist.id, {
        status: changeStatusArtistDto.status,
      });
    } else {
      throw new BadRequestException(CustomErrorMessage['ARTIST.NOT_FOUND']);
    }
  }

  async getWhitelistByAddress(address) {
    const user = await this.userService.findUserByAddress(address);
    if (!user) {
      throw new BadRequestException(CustomErrorMessage['USER.USER_NOT_FOUND']);
    }
    const whitelists = await this.whitelistRepository
      .createQueryBuilder('whitelist')
      .select([
        'whitelist.id as id',
        'whitelist.status as status',
        'networks.id as networkId',
      ])
      .where('whitelist.user_id = :id', { id: user.id })
      .leftJoin('networks', 'networks', 'whitelist.network_id = networks.id ')
      .getRawMany();

    return whitelists;
  }
}
