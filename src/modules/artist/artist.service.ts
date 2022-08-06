import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { getPagination } from 'src/common/utility/common.utility';
import { ArtistRepository } from './artist.repository';
import { Artist } from './entities/artist.entity';
import { StatusArtists } from './enum';
import { GetListArtistDto } from '../admin/dto/get-list-artist';
import { RequestArtistDto } from '../users/dto/request-artist.dto';
@Injectable()
export class ArtistService {
  constructor(private readonly artistRepository: ArtistRepository) {}

  async requestArtist(user: User, requestArtistDto: RequestArtistDto) {
    let artist = await this.findOneArtist(user.id, null);
    if (artist) {
      artist.status = StatusArtists.PENDING;
      artist.firstAnswer = requestArtistDto.firstAnswer;
      artist.secondAnswer = requestArtistDto.secondAnswer;
      await this.artistRepository.save(artist);
      return artist;
    }
    return await this.saveNewArtist(user, requestArtistDto);
  }

  async saveNewArtist(user: User, requestArtistDto: RequestArtistDto) {
    let artistNew = new Artist();
    artistNew.user = user;
    artistNew.status = StatusArtists.PENDING;
    artistNew.firstAnswer = JSON.stringify(requestArtistDto.firstAnswer);
    artistNew.secondAnswer = requestArtistDto.secondAnswer;
    return await this.artistRepository.save(artistNew);
  }

  async findOneArtist(userId, address) {
    let query = {};
    if (address) {
      query = {
        user: { userWallet: { address: address } },
      };
    } else {
      query = {
        user: { id: userId },
      };
    }
    let artist = await this.artistRepository.findOne({
      relations: ['user'],
      where: {
        ...query,
      },
    });
    return artist;
  }

  async getAllArtist(getListArtistDto: GetListArtistDto) {
    const { status, page, limit } = getListArtistDto;
    const $query = this.artistRepository
      .createQueryBuilder('artists')
      .select([
        'artists.status as status',
        'user.id as userId',
        'user.userName as userName',
        'user.email as email',
        'user.twitterSite as twitter',
        'user.avatar as picture',
        'artists.firstAnswer as firstAnswer',
        'artists.secondAnswer as secondAnswer',
        'userWallet.address as address',
        'user.instagramSite as instagramSite',
        'artists.createdAt as createdAt',
        'artists.updatedAt as updatedAt',
      ])
      .leftJoin('artists.user', 'user')
      .leftJoin('user.userWallet', 'userWallet');
    if (status) {
      $query.andWhere('artists.status = :status', { status: status });
    }
    if (page && limit) {
      $query.limit(limit).offset(limit * (page - 1));
    }
    const [data, count] = await Promise.all([
      $query.getRawMany(),
      $query.getCount(),
    ]);
    return getPagination(data, count, Math.ceil(count / limit), page);
  }
}
