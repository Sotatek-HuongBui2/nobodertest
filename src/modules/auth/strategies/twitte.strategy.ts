import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-twitter';
import { UserService } from 'src/modules/users/user.service';
import { UserRepository } from 'src/modules/users/user.repository';
import { UserVerify } from 'src/modules/users/enums';
import { CustomErrorMessage } from 'src/common/constants/error-message';

export interface Data {
  height: number;
  is_silhouette: boolean;
  url: string;
  width: number;
}

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  private readonly logger = new Logger(TwitterStrategy.name);

  constructor(
    private userService: UserService,
    private userRepository: UserRepository
  ) {
    super({
      consumerKey: process.env.CONSUME_KEY,
      consumerSecret: process.env.CONSUME_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      includeEmail: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    try {
      const username = profile.username
      const user = await this.userRepository.findOne({ twitterSite: username });
      if (user) {
        await this.userRepository.update(user.id, { twitterVerified: UserVerify.TRUE })
        done(null, user);
      } else {
        done(null, {})
        throw new BadRequestException(
          CustomErrorMessage[
          'USER.VERIFY_FAILED'
          ],
        );
      }
    } catch (error) {
      this.logger.error('Facebook Authentication Error', error);
      done(null, {});
    }
  }
}
