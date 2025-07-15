import { ValidationArguments, ValidatorConstraintInterface } from "class-validator";
export declare class ExactlyTwoGuarantorsConstraint implements ValidatorConstraintInterface {
    validate(guarantors: any[], args: ValidationArguments): boolean;
    private isValidPhoneNumber;
    private isValidEmail;
    defaultMessage(args: ValidationArguments): string;
}
