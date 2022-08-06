import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserService } from 'src/modules/users/user.service';
import { Injectable } from '@nestjs/common';
import { userStatus } from 'src/modules/auth/enums';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsAddressNotExistConstraint implements ValidatorConstraintInterface {
  constructor(private userService: UserService) {}

  validate(address: string, args: ValidationArguments) {
    return this.userService.findUserByAddress(address).then(user => {
      if (!user) {
        return true;
      }
      return (
        user.userName.toLowerCase() === address.toLowerCase() && user.status === userStatus.INACTIVE
      );
    });
  }

  defaultMessage(args: ValidationArguments) {
    return 'ADDRESS.ADDRESS_EXISTED';
  }
}

export function IsNotExistAddress(validationOptions?: ValidationOptions) {
  return function (object: Record<any, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAddressNotExistConstraint,
    });
  };
}
