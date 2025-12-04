import db from '../config/db';
import { UserRow, UserIdentityRow } from '../types/database';

export interface CreateUserParams {
    email: string;
    passwordHash: string;
    role: string;
    avatar?: string;
}

export interface CreateOAuthUserParams {
    email: string;
    role: string;
    avatar?: string;
    provider: string;
    providerId: string;
    accessToken?: string;
}

// 映射 User 資料（注意：現在 User 表沒有 password_hash 了）
const mapUser = (row: UserRow | undefined) => {
    if (!row) return null;
    return {
        id: row.id,
        email: row.email,
        role: row.role,
        avatar: row.avatar,
        createdAt: row.created_at,
        resetPasswordToken: row.reset_password_token,
        resetPasswordExpires: row.reset_password_expires
    };
};

// 這是包含「密碼雜湊」的使用者物件，僅用於登入驗證
// 因為我們把密碼拆到 identities 表了，所以登入時需要特別查出來
export interface UserWithPassword {
    id: number;
    email: string;
    role: string;
    passwordHash: string | null; // 從 Local Identity 來的
    avatar?: string | null;
}

// 透過 Email 尋找使用者，並嘗試 Join Local Identity 來取得密碼（如果有的話）
export const findUserByEmailWithPassword = async (email: string): Promise<UserWithPassword | null> => {
    const queryText = `
        SELECT u.*, ui.credential as password_hash 
        FROM users u
        LEFT JOIN user_identities ui ON u.id = ui.user_id AND ui.provider = 'local'
        WHERE u.email = $1
    `;
    const result = await db.query(queryText, [email]);
    const row = result.rows[0];

    if (!row) return null;

    return {
        id: row.id,
        email: row.email,
        role: row.role,
        avatar: row.avatar,
        passwordHash: row.password_hash // 可能是 null (如果是純 OAuth 用戶)
    };
};

// 單純找 User 基本資料
export const findUserByEmail = async (email: string) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return mapUser(result.rows[0] as UserRow);
};

// 建立本地使用者 (Email + Password)
// 使用 Transaction 確保 User 和 Identity 同時建立
export const createUser = async (params: CreateUserParams) => {
    const { email, passwordHash, role, avatar } = params;
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Create User
        const userRes = await client.query('INSERT INTO users (email, role, avatar) VALUES ($1, $2, $3) RETURNING *', [
            email,
            role,
            avatar || null
        ]);
        const newUser = userRes.rows[0] as UserRow;

        // 2. Create Local Identity
        await client.query('INSERT INTO user_identities (user_id, provider, credential) VALUES ($1, $2, $3)', [
            newUser.id,
            'local',
            passwordHash
        ]);

        await client.query('COMMIT');
        return mapUser(newUser);
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

// 建立 OAuth 使用者 (Email + Provider Info)
export const createOAuthUser = async (params: CreateOAuthUserParams) => {
    const { email, role, avatar, provider, providerId, accessToken } = params;
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Create User
        const userRes = await client.query('INSERT INTO users (email, role, avatar) VALUES ($1, $2, $3) RETURNING *', [
            email,
            role,
            avatar || null
        ]);
        const newUser = userRes.rows[0] as UserRow;

        // 2. Create Provider Identity
        await client.query(
            'INSERT INTO user_identities (user_id, provider, provider_id, credential) VALUES ($1, $2, $3, $4)',
            [newUser.id, provider, providerId, accessToken || null]
        );

        await client.query('COMMIT');
        return mapUser(newUser);
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

// 為現有使用者新增 Identity (例如綁定 Google)
export const addIdentityToUser = async (userId: number, provider: string, providerId: string, credential?: string) => {
    const result = await db.query(
        'INSERT INTO user_identities (user_id, provider, provider_id, credential) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, provider, providerId, credential || null]
    );
    return result.rows[0] as UserIdentityRow;
};

// 透過 Provider ID 尋找使用者 (OAuth 登入用)
export const findUserByProvider = async (provider: string, providerId: string) => {
    const queryText = `
        SELECT u.* 
        FROM users u
        JOIN user_identities ui ON u.id = ui.user_id
        WHERE ui.provider = $1 AND ui.provider_id = $2
    `;
    const result = await db.query(queryText, [provider, providerId]);
    return mapUser(result.rows[0] as UserRow);
};

export const findUserById = async (id: number) => {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return mapUser(result.rows[0] as UserRow);
};

// 更新重設密碼 Token
export const updateResetToken = async (email: string, token: string | null, expires: Date | null) => {
    const result = await db.query(
        'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3 RETURNING *',
        [token, expires, email]
    );
    return mapUser(result.rows[0] as UserRow);
};

export const findUserByResetToken = async (token: string) => {
    const result = await db.query('SELECT * FROM users WHERE reset_password_token = $1', [token]);
    return mapUser(result.rows[0] as UserRow);
};

// 更新密碼 (其實是更新 Local Identity 的 credential)
export const updatePassword = async (userId: number, passwordHash: string) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Update Identity
        // 這裡假設一定有 local identity，如果沒有應該要 insert，但重設密碼通常針對已存在的 local 帳號
        // 為了安全，如果沒有 local identity 則新增一個
        const identityRes = await client.query('SELECT id FROM user_identities WHERE user_id = $1 AND provider = $2', [
            userId,
            'local'
        ]);

        if (identityRes.rows.length > 0) {
            await client.query('UPDATE user_identities SET credential = $1 WHERE user_id = $2 AND provider = $3', [
                passwordHash,
                userId,
                'local'
            ]);
        } else {
            await client.query('INSERT INTO user_identities (user_id, provider, credential) VALUES ($1, $2, $3)', [
                userId,
                'local',
                passwordHash
            ]);
        }

        // 2. Clear Reset Token on User
        const userRes = await client.query(
            'UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = $1 RETURNING *',
            [userId]
        );

        await client.query('COMMIT');
        return mapUser(userRes.rows[0] as UserRow);
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};
