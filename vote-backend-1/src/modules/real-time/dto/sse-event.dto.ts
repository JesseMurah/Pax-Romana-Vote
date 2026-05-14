import { IsDate, IsEnum, IsObject, IsOptional, IsString } from "class-validator";
import { SseEventType } from "../enums/sse-event-types.enum";

export class SseEventDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsEnum(SseEventType)
    type: SseEventType;

    @IsObject()
    data: any;

    @IsDate()
    timestamp: Date;

    @IsOptional()
    @IsString()
    retry?: string;
}