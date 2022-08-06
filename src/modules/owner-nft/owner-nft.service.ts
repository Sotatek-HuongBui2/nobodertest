import { Injectable, Logger } from '@nestjs/common';
import { OwnerNftRepository } from 'src/modules/owner-nft/owner-nft.repository';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class OwnerNftService {
  constructor(private readonly ownerNftsRepository: OwnerNftRepository) { }

  private readonly logger = new Logger(OwnerNftService.name);

  async isOwnerByNftid(user: User, nftId: number) {
    const data = await this.ownerNftsRepository.isOwnerByNftid(user, nftId);
    return !!data;
  }

  async findOwnerByNftid(nftId: number) {
    const data = await this.ownerNftsRepository.findOwnerByNftid(nftId);
    return data;
  }

  async findAllOwnerByNFTId(nftId: number) {
    const data = await this.ownerNftsRepository.findAllOwnerByNFTId(nftId);
    return data;
  }

  async findAllNFTsByOwnerUser(user: User) {
    const data = await this.ownerNftsRepository.getNFTsByOwner(user)
    return data
  }
}
