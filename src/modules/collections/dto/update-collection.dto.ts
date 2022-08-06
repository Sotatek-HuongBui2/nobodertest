
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { Collection } from '../entities/collections.entity';
import { CreateCollectionDto } from './create-collection.dto';

export class UpdateCollectionDto{

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;
  
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  banner: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image: string;

  toUpdateEntity() {
    let collection = new Collection();
    if (this.image) {
      collection.iconImage = this.image;
    }
    if (this.banner) {
      collection.bannerImage = this.banner;
    }
    return collection;
  }
}
