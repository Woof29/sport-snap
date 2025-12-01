export type UserRole = 'buyer' | 'photographer' | 'admin';

export interface User {
    id: number;
    email: string;
    role: string; // 雖然我們有 UserRole，但在某些通用情況下可能接收 string，或者這裡應該嚴格使用 UserRole。為了兼容性先用 string，建議後續收緊。
    // role: UserRole; // 理想情況
    name?: string;
    avatar?: string;
    createdAt?: string;
}
