import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { Injectable } from '@nestjs/common';
import { User } from 'src/modules/users/entities/user.entity';
import { AuthService, JWTPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    } as StrategyOptions);
  }

  async validate(payload: JWTPayload) {
    const user = await this.authService.getUserProfile(payload.sub);
    return user[0];
  }
}
