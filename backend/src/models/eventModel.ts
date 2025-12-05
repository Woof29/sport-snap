import db from '../config/db';
import { SqlValue, EventRow } from '../types/database';
import { Event } from '../types/event';

export interface CreateEventParams {
    name: string;
    date: Date;
    location: string;
    description: string;
    sportType: string;
    coverImage: string;
    organizerId: number;
    status: string;
}

// 增加這個轉換函數，把資料庫的 snake_case 轉成駝峰命名
const mapEvent = (row: EventRow | undefined): Event | null => {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        date: row.date,
        location: row.location,
        description: row.description,
        sportType: row.sport_type,
        coverImage: row.cover_image,
        status: row.status,
        organizerId: row.organizer_id,
        createdAt: row.created_at
    };
};

export const getAllEvents = async () => {
    const result = await db.query('SELECT * FROM events ORDER BY date DESC');
    return result.rows.map((row) => mapEvent(row as EventRow));
};

export const getEventById = async (id: number) => {
    const result = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    return mapEvent(result.rows[0] as EventRow);
};

export const createEvent = async (params: CreateEventParams) => {
    const { name, date, location, description, sportType, coverImage, organizerId, status } = params;
    const result = await db.query(
        'INSERT INTO events (name, date, location, description, sport_type, cover_image, organizer_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [name, date, location, description, sportType, coverImage, organizerId, status]
    );
    return mapEvent(result.rows[0] as EventRow);
};

export const updateEvent = async (id: number, params: Partial<CreateEventParams>) => {
    // 動態建立更新 SQL，只更新有值的欄位
    const updates: string[] = [];
    const values: SqlValue[] = [];
    let paramCount = 1;

    const fields: Record<string, SqlValue | undefined> = {
        name: params.name,
        date: params.date,
        location: params.location,
        description: params.description,
        sport_type: params.sportType,
        cover_image: params.coverImage,
        status: params.status
        // 注意：通常我們不允許更新 organizer_id
    };

    Object.keys(fields).forEach((key) => {
        const value = fields[key];
        if (value !== undefined) {
            updates.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        }
    });

    if (updates.length === 0) return null;

    values.push(id);
    const query = `UPDATE events SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await db.query(query, values);
    return mapEvent(result.rows[0] as EventRow);
};

export const deleteEvent = async (id: number) => {
    const result = await db.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
    return mapEvent(result.rows[0] as EventRow);
};
