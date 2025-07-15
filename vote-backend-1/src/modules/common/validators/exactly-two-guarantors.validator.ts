import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'exactlyTwoGuarantors', async: false })
export class ExactlyTwoGuarantorsConstraint implements ValidatorConstraintInterface {
    validate(guarantors: any[], args: ValidationArguments) {
        if (!Array.isArray(guarantors)) return false;
        if (guarantors.length !== 2) return false;

        // Validate each guarantor has required fields
        return guarantors.every(guarantor =>
            guarantor.name &&
            guarantor.phoneNumber &&
            guarantor.email &&
            guarantor.name.length >= 2 &&
            this.isValidPhoneNumber(guarantor.phoneNumber) &&
            this.isValidEmail(guarantor.email)
        );
    }

    private isValidPhoneNumber(phone: string): boolean {
        const ghanaPhoneRegex = /^(\+233|0)(2[0-9]|5[0-9]|2[4-9]|3[0-9])[0-9]{7}$/;
        return ghanaPhoneRegex.test(phone);
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Exactly two guarantors with valid name, phone number, and email are required';
    }
}