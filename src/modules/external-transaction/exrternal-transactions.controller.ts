import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserScope } from '../../common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateExternalTransactionDto } from './dto/create-external-transaction.dto';
import { ExternalTransactionsService } from './external-transactions.service';

@ApiTags('external-transactions')
@Controller('external-transactions')
export class ExternalTransactionsController {
  constructor(
    private readonly externalTransactionsService: ExternalTransactionsService,
  ) {}

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post('external-user-send-tx')
  // async externalUserSendTx(
  //   @Body() createExternalTransactionDto: CreateExternalTransactionDto,
  //   @UserScope() user: User,
  // ) {
  //   createExternalTransactionDto.address = user.userWallet.address;
  //   return this.externalTransactionsService.externalUserSendTx(
  //     createExternalTransactionDto,
  //   );
  // }
}
