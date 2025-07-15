import {IsPhoneNumber, IsString, Length} from "class-validator";

export class phoneVerificationDto {
    @IsPhoneNumber('GH')
    phoneNumber: string

    @IsString()
    @Length(6, 6, { message: 'PIN code must be exactly 6 digits' })
    verificationCode: string
}