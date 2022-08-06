import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Collection } from '../entities/collections.entity';
import { User } from '../../users/entities/user.entity';
import { CollectionStatus, collectionType } from '../enums';
import { NetworkService } from 'src/modules/networks/network.service';

export class CreateCollectionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  banner: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  contractAddress: string;

  @IsOptional()
  status: CollectionStatus;

  @IsOptional()
  type: collectionType;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  networkId: number;

  async toEntity(user: User, networkService: NetworkService) {
    const network = await networkService.findOne(this.networkId);
    const collection = new Collection();
    collection.symbol = this.symbol;
    collection.name = this.name;
    collection.description = this.description;
    collection.network = network;
    collection.contractAddress = this.contractAddress;
    collection.status = this.status ? this.status : CollectionStatus.PENDING;
    collection.type = this.type || collectionType.xanalia721;
    collection.userId = user.id;
    collection.iconImage = this.image;
    collection.bannerImage = this.banner;
    return collection;
  }
}
