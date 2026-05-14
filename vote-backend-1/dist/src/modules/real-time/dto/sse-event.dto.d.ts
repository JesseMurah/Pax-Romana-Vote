import { SseEventType } from "../enums/sse-event-types.enum";
export declare class SseEventDto {
    id?: string;
    type: SseEventType;
    data: any;
    timestamp: Date;
    retry?: string;
}
