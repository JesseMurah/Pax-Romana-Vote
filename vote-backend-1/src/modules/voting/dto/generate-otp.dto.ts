import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator";
import { Transform } from "class-transformer";

function normalizePhoneNumber(phone: string): string {
    if (!phone) return phone;

    // Remove all non-digits
    const digitsOnly = phone.replace(/\D/g, '');

    // Handle different formats
    if (digitsOnly.startsWith('233')) {
        // Already in international format without +
        return digitsOnly;
    } else if (digitsOnly.startsWith('0')) {
        // Ghana local format (0XXXXXXXXX) -> convert to international
        return '233' + digitsOnly.substring(1);
    } else if (digitsOnly.length === 9) {
        // Missing leading 0, add country code
        return '233' + digitsOnly;
    }

    return digitsOnly;
}

export class GenerateOtpDto {
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    @Transform(({ value }) => value?.toString().trim())
    name: string;

    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    @Transform(({ value }) => value?.toString().trim().toLowerCase())
    email: string;

    @IsString({ message: 'Phone number must be a string' })
    @IsNotEmpty({ message: 'Phone number is required' })
    @Transform(({ value }) => normalizePhoneNumber(value?.toString().trim()))
    phoneNumber: string;
}