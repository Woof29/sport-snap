// SQL 參數允許的類型
export type SqlValue = string | number | Date | boolean | null;

// 資料庫原始回傳的 User 結構 (snake_case)
export interface UserRow {
    id: number;
    email: string;
    password_hash: string;
    role: string;
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
