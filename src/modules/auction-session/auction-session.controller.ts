import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuctionSessionService } from 'src/modules/auction-session/auction-session.service';
import { User } from '../users/entities/user.entity';
import { UserScope } from 'src/common/decorators/user.decorator';
import { CreateAuctionSession } from './dto/create-auction-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('auction-session')
@Controller('auction-session')
export class AuctionSessionController {
  constructor(private readonly auctionSessionService: AuctionSessionService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  newAuctionSession(
    @UserScope() user: User,
    @Body() body: CreateAuctionSession,
  ) {
    return this.auctionSessionService.newAuctionSession(user, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('cancel/:auctionId')
  cancelAuctionSession(@UserScope() user: User, @Param() { auctionId }) {
    return this.auctionSessionService.cancelAuction(Number(auctionId), user);
  }
}
