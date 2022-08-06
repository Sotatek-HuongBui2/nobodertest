import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserService } from 'src/modules/users/user.service';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailNormalUserNotExistConstraint implements ValidatorConstraintInterface {
  constructor(private userService: UserService) {}

  validate(email: any, args: ValidationArguments) {
    return this.userService
      .findByEmail(email)
      .then(email => {
        return !email;
      });
  }

  defaultMessage(args: ValidationArguments) {
    return 'EMAIL.EMAIL_EXISTED';
  }
}

export function IsNotExistEmailRangeNorMalUser(validationOptions?: ValidationOptions) {
  return function (object: Record<any, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailNormalUserNotExistConstraint,
    });
  };
}
