import { IsNotEmpty, IsObject, IsString } from "class-validator";

export class SubmitVoteDto {
    @IsString()
    @IsNotEmpty()
    sessionId: string;

    @IsObject()
    @IsNotEmpty()
    votes: Record<string, string>; // { position: candidateId }
}