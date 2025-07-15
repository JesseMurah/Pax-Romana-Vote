import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function ValidateTwoGuarantors(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'validateTwoGuarantors',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (!Array.isArray(value)) return false;
                    if (value.length !== 2) return false;

                    // Check if both guarantors have required fields
                    return value.every(guarantor =>
                        guarantor.name &&
                        guarantor.phoneNumber &&
                        guarantor.email
                    );
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Exactly two guarantors with complete information are required';
                },
            },
        });
    };
}