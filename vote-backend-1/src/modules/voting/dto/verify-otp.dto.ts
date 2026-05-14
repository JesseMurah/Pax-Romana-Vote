import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class VerifyOtpDto {
    @IsString({ message: 'Phone number must be a string' })
    @IsNotEmpty({ message: 'Phone number is required' })
    @Length(10, 15, { message: 'Phone number must be between 10 and 15 characters' })
    @Matches(/^\d+$/, { message: 'Phone number must contain only numbers' })
    phoneNumber: string;

    @IsString({ message: 'OTP must be a string' })
    @IsNotEmpty({ message: 'OTP is required' })
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    @Matches(/^\d{6}$/, { message: 'OTP must contain only numbers' })
    otp: string;

    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
}