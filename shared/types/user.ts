export type UserRole = 'buyer' | 'photographer' | 'admin';

export interface User {
    id: number;
    email: string;
    role: string;
    name?: string;
    avatar?: string;
    createdAt?: string;
}
