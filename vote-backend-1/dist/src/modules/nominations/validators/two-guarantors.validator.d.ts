import { ValidationArguments, ValidatorConstraintInterface } from "class-validator";
export declare class ExactlyTwoGuarantorsConstraint implements ValidatorConstraintInterface {
    validate(guarantors: any[], args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
