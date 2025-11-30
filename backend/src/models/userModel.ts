import db from '../config/db';
import { UserRow } from '../types/database';

export interface CreateUserParams {
    email: string;
    passwordHash: string;
    role: string;
}

// 增加這個轉換函數，把資料庫的 snake_case 轉成駝峰命名
const mapUser = (row: UserRow | undefined) => {
    if (!row) return null;
    return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash, // 注意這裡的轉換
        role: row.role,
        createdAt: row.created_at
    };
};

export const findUserByEmail = async (email: string) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return mapUser(result.rows[0] as UserRow);
};

export const createUser = async (params: CreateUserParams) => {
    const { email, passwordHash, role } = params;
    const result = await db.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
        [email, passwordHash, role]
    );
    return mapUser(result.rows[0] as UserRow);
};

export const findUserById = async (id: number) => {
    const result = await db.query('SELECT id, email, role, created_at FROM users WHERE id = $1', [id]);
    return mapUser(result.rows[0] as UserRow);
};
