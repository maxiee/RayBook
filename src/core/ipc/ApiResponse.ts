export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    payload?: T;
}