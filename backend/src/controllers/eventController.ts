import { Request, Response } from 'express';
import pool from '../config/db';

// Get all events
export const getAllEvents = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM events ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get event by ID
export const getEventById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create new event
export const createEvent = async (req: Request, res: Response) => {
    const { name, date, location, description, sport_type, cover_image, max_participants } = req.body;
    // @ts-ignore
    const organizer_id = req.user.id; // From authMiddleware

    try {
        const result = await pool.query(
            `INSERT INTO events (name, date, location, description, sport_type, cover_image, max_participants, organizer_id, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [name, date, location, description, sport_type, cover_image, max_participants, organizer_id, 'published'] // Default to published for simplicity for now
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update event
export const updateEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, date, location, description, sport_type, cover_image, max_participants, status } = req.body;
    // @ts-ignore
    const user_id = req.user.id;

    try {
        // Check if user is the organizer
        const eventCheck = await pool.query('SELECT organizer_id FROM events WHERE id = $1', [id]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (eventCheck.rows[0].organizer_id !== user_id) {
            return res.status(403).json({ error: 'Not authorized to update this event' });
        }

        const result = await pool.query(
            `UPDATE events SET name = $1, date = $2, location = $3, description = $4, sport_type = $5, 
       cover_image = $6, max_participants = $7, status = $8 WHERE id = $9 RETURNING *`,
            [name, date, location, description, sport_type, cover_image, max_participants, status, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete event
export const deleteEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    // @ts-ignore
    const user_id = req.user.id;

    try {
        // Check if user is the organizer
        const eventCheck = await pool.query('SELECT organizer_id FROM events WHERE id = $1', [id]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (eventCheck.rows[0].organizer_id !== user_id) {
            return res.status(403).json({ error: 'Not authorized to delete this event' });
        }

        await pool.query('DELETE FROM events WHERE id = $1', [id]);
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
