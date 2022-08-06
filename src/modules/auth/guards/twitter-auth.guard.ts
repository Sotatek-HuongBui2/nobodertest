import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { userStatus } from '../enums';

@Injectable()
export class TwitterAuthGuard extends AuthGuard('twitter') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user || user.status === userStatus.INACTIVE) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
