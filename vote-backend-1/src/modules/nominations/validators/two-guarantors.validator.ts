import { ValidationArguments, ValidatorConstraintInterface } from "class-validator";


export class ExactlyTwoGuarantorsConstraint implements ValidatorConstraintInterface{
    validate(guarantors: any[], args: ValidationArguments) {
        return Array.isArray(guarantors) && guarantors.length === 2;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Exactly two guarantors are required';
    }
}