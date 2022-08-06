import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/users/user.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsExistReferralCodeConstraint implements ValidatorConstraintInterface {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService
  ) {}

  async validate(inviteCode: any, args: ValidationArguments) {
    if (!inviteCode) return true;
    const user = await this.userService.findInviteCode(inviteCode);
    return !!user;
  }

  defaultMessage(args: ValidationArguments) {
    return 'REFERRAL.REFERRAL_CODE_NOT_EXISTS';
  }
}

export function IsExistInviteCode(validationOptions?: ValidationOptions) {
  return function (object: Record<any, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsExistReferralCodeConstraint,
    });
  };
}
