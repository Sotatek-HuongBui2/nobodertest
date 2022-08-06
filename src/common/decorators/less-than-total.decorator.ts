import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsRangeSumConstraint implements ValidatorConstraintInterface {
  validate(quantityInput: number, args: ValidationArguments) {
    const [noCopyParam] = args.constraints;
    const noCopy = (args.object as any)[noCopyParam];
    if (quantityInput == undefined) {
      quantityInput = 0;
    }

    return quantityInput <= noCopy;
  }

  defaultMessage(args: ValidationArguments) {
    return 'total quantity of sale and farming must be greater or equal to number of copies';
  }
}

export function LessThanTotal(noCopy: any, validationOptions?: ValidationOptions) {
  return function (object: Record<any, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [noCopy],
      validator: IsRangeSumConstraint,
    });
  };
}
