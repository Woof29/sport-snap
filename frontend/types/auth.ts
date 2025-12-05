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

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface GoogleLoginRequest {
    idToken: string;
    role?: string; // Optional, if new user needs role
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface CurrentUserResponse {
    user: User;
}
