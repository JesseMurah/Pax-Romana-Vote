import {
    registerDecorator,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";

@ValidatorConstraint({ name: 'isKnustPhone', async: false })
export class IsKnustPhoneConstraint implements ValidatorConstraintInterface {
    validate(phoneNumber: string, args: ValidationArguments) {
        if (!phoneNumber) return false;

        // Ghana phone number formats
        const ghanaPhoneRegex = /^(\+233|0)(2[0-9]|5[0-9]|2[4-9]|3[0-9])[0-9]{7}$/;
        return ghanaPhoneRegex.test(phoneNumber);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Phone number must be a valid Ghana phone number (e.g., +233241234567 or 0241234567)';
    }
}

export function IsKnustPhone(validationOptions?: any) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsKnustPhoneConstraint,
        });
    };
}