export declare class ApiResponseDto<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
    timestamp: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    constructor(success: boolean, message: string, data?: T, errors?: string[]);
}
