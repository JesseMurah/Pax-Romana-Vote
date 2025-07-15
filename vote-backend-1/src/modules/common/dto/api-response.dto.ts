export class ApiResponseDto<T> {
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

    constructor(success: boolean, message: string, data?: T, errors?: string[]) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
        this.timestamp = new Date().toISOString();
    }
}