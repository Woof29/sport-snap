import { User } from './user';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface CurrentUserResponse {
    user: User;
}
