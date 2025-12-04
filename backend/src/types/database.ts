// SQL 參數允許的類型
export type SqlValue = string | number | Date | boolean | null;

// 資料庫原始回傳的 User 結構 (snake_case)
// 注意：password_hash 已移除，新增 avatar
export interface UserRow {
    id: number;
    email: string;
    role: string;
    avatar: string | null;
    created_at: Date;
    reset_password_token?: string | null;
    reset_password_expires?: Date | null;
}

// 資料庫原始回傳的 UserIdentity 結構 (snake_case)
export interface UserIdentityRow {
    id: number;
    user_id: number;
    provider: string;
    provider_id: string | null;
    credential: string | null;
    created_at: Date;
}

// 資料庫原始回傳的 Event 結構 (snake_case)
export interface EventRow {
    id: number;
    name: string;
    date: Date;
    location: string;
    description: string;
    sport_type: string;
    cover_image: string;
    status: string;
    organizer_id: number;
    created_at: Date;
}
