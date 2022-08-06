import {
  Controller,
  UseGuards,
  Post,
  Body,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserScope } from 'src/common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { SaleNftAuctionService } from './sale-nft-auction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlaceBidAuctionDto } from './dto/auction/place-bid.dto';

@ApiTags('auction/:auctionSessionId')
@Controller('auction/:auctionSessionId')
export class SaleNftAuctionController {
  constructor(
    private readonly saleNftAuctionService: SaleNftAuctionService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('place-bid')
  async createBidAuctionSession(
    @Param('auctionSessionId') auctionSessionId: number,
    @UserScope() user: User,
    @Body() body: PlaceBidAuctionDto,
  ) {
    const result = await this.saleNftAuctionService.createBidAuctionSession(
      auctionSessionId,
      user,
      body,
    );
    return {
      dataReturn: result,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('accept-bid/:bidId')
  acceptBidAuctionSession(
    @Param('auctionSessionId') auctionSessionId: number,
    @Param('bidId') bidId: number,
    @UserScope() user: User,
  ) {
    return this.saleNftAuctionService.acceptBidAuctionSession(
      auctionSessionId,
      bidId,
      user,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('reclaim-nft')
  reClaimNftAuctionSession(
    @Param('auctionSessionId') auctionSessionId: number,
    @UserScope() user: User,
  ) {
    return this.saleNftAuctionService.reClaimNftAuctionSession(
      auctionSessionId,
      user,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('cancel-bid/:bidId')
  cancelBidAuctionSession(
    @Param('auctionSessionId') auctionSessionId: number,
    @Param('bidId') bidId: number,
    @UserScope() user: User,
  ) {
    return this.saleNftAuctionService.cancelBidAuctionSession(
      auctionSessionId,
      bidId,
      user,
    );
  }
}
