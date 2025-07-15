export class PhoneValidationUtil {
    static normalizeGhanaPhone(phoneNumber: string): string {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');

        // Convert to international format
        if (cleaned.startsWith('233')) {
            return `+${cleaned}`;
        } else if (cleaned.startsWith('0')) {
            return `+233${cleaned.substring(1)}`;
        } else if (cleaned.length === 9) {
            return `+233${cleaned}`;
        }

        return phoneNumber; // Return original if format is unclear
    }

    static isValidGhanaPhone(phoneNumber: string): boolean {
        const normalized = this.normalizeGhanaPhone(phoneNumber);
        const ghanaPhoneRegex = /^\+233(2[0-9]|5[0-9]|2[4-9]|3[0-9])[0-9]{7}$/;
        return ghanaPhoneRegex.test(normalized);
    }

    static formatForDisplay(phoneNumber: string): string {
        const normalized = this.normalizeGhanaPhone(phoneNumber);
        if (normalized.startsWith('+233')) {
            const number = normalized.substring(4);
            return `+233 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
        }
        return phoneNumber;
    }
}