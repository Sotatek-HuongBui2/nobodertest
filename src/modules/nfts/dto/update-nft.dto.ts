import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateNftDto } from './create-nft.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { NftStatus } from '../enums';

export class UpdateNftDto extends PartialType(CreateNftDto) {
  @ApiProperty()
  //@IsNotEmpty()
  @IsOptional()
  @IsString()
  originImage: string;

  @ApiProperty()
  //@IsNotEmpty()
  @IsOptional()
  @IsString()
  smallImage: string;

  @ApiProperty()
  //@IsNotEmpty()
  @IsOptional()
  @IsString()
  largeImage: string;

  @ApiProperty()
  //@IsNotEmpty()
  @IsOptional()
  @IsString()
  ipfsJson: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  status?: NftStatus;

  @ApiProperty()
  @IsOptional()
  fileExtension: string;

  @ApiProperty()
  @IsOptional()
  previewImage: string;

  @ApiProperty()
  @IsOptional()
  fullImage: string;

  toUpdateEntity() {
    let result = {};
    if (this.originImage) result['originImage'] = process.env.PUBLIC_IMAGE_URL_PREFIX + this.originImage;
    if (this.smallImage) result['smallImage'] = process.env.PUBLIC_IMAGE_URL_PREFIX + this.smallImage;
    if (this.largeImage) result['largeImage'] = process.env.PUBLIC_IMAGE_URL_PREFIX + this.largeImage;
    if (this.ipfsJson) result['ipfsJson'] = process.env.PUBLIC_IMAGE_URL_PREFIX + this.ipfsJson;
    if (this.previewImage) result['previewImage'] = process.env.PUBLIC_IMAGE_URL_PREFIX + this.previewImage;
    if (this.fullImage) result['fullImage'] = process.env.PUBLIC_IMAGE_URL_PREFIX + this.fullImage;
    if (this.status) result['status'] = this.status;
    if (this.fileExtension) result['fileExtension'] = this.fileExtension;
    return result;
  }
}
