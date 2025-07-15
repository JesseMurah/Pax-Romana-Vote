import { ValidationArguments, ValidatorConstraintInterface } from "class-validator";
export declare class IsKnustPhoneConstraint implements ValidatorConstraintInterface {
    validate(phoneNumber: string, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsKnustPhone(validationOptions?: any): (object: Object, propertyName: string) => void;
