import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { userType } from '../../modules/users/enums';
import { Market, NftType } from '../../modules/nfts/enums';
import { getRepository } from 'typeorm';
import { Collection } from '../../modules/collections/entities/collections.entity';
import { collectionType } from '../../modules/collections/enums';
import { CustomErrorMessage } from '../constants/error-message';

@Injectable()
export class ValidateNftInterceptor implements NestInterceptor {
  public async intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: any = _context.switchToHttp().getRequest();
    const user = request.user;
    const nft = request.body;
    const isPumpkin = 1 <= nft.price || undefined;
    const collectionRepository = await getRepository(Collection);

    nft.market = Market.COMMON_MARKET;

    const collection = await collectionRepository.findOne({
      relations: ['network'],
      where: {
        id: nft.collectionId
      },
    });

    if (!collection) {
      throw new BadRequestException(
        CustomErrorMessage[
        'COLLECTIONS.NOT_FOUND'
        ],
      );
    }

    if (collection.userId != user.id && collection.type != collectionType.default) {
      throw new BadRequestException(
        CustomErrorMessage[
        'VALIDATE_NFT.COLLECTION_DOES_NOT_BELONG_TO_THIS_USER'
        ],
      );
    }

    if (collection.type === collectionType.xanalia1155 && !isPumpkin) {
      throw new BadRequestException(
        CustomErrorMessage['VALIDATE_NFT.PUMPKIN_MUST_BE_GREATER_THAN_1'],
      );
    }

    if (collection.type === collectionType.xanalia1155) {
      if (nft.noCopy > 1000) {
        throw new BadRequestException(
          CustomErrorMessage[
          'VALIDATE_NFT.NUMBER_OF_COPIES_OVER_ACCEPTED_AMOUNT'
          ],
        );
      }

      if (nft.quantity !== nft.noCopy) {
        throw new BadRequestException(
          CustomErrorMessage[
          'VALIDATE_NFT.NUMBER_OF_COPY_MUST_BE_EQUAL_TO_QUANTITY'
          ],
        );
      }
    }

    nft.user = request?.user;

    return next.handle();
  }
}
