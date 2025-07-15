import {IsPhoneNumber, IsString, MinLength} from "class-validator";

export class voterAuthDto {
    @IsPhoneNumber('GH')
    phoneNumber: string;


    @IsString()
    @MinLength(2)
    name: string;
    // email: string;
}