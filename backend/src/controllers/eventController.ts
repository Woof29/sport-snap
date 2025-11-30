import { Request, Response } from 'express';
import * as eventModel from '../models/eventModel';

// Get all events
export const getAllEvents = async (req: Request, res: Response) => {
    try {
        const allEvents = await eventModel.getAllEvents();
        res.json(allEvents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get event by ID
export const getEventById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const event = await eventModel.getEventById(Number(id));
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create new event
export const createEvent = async (req: Request, res: Response) => {
    const { name, date, location, description, sportType, coverImage, status } = req.body;

    // 修正: 從 req.user.user.id 獲取 ID (根據 AuthController 的 payload 結構)
    // @ts-ignore
    const organizerId = req.user?.user?.id;

    if (!organizerId) {
        return res.status(401).json({ error: 'User ID not found in token' });
    }

    try {
        const newEvent = await eventModel.createEvent({
            name,
            date,
            location,
            description,
            sportType,
            coverImage,
            organizerId,
            status: status || 'published' // Default to published
        });
        res.status(201).json(newEvent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update event
export const updateEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    // 只需要從 body 拿這些資料，不用管 organizerId
    const { name, date, location, description, sportType, coverImage, status } = req.body;

    // @ts-ignore
    const userId = req.user?.user?.id;

    try {
        // Check if user is the organizer
        const event = await eventModel.getEventById(Number(id));

        if (!event) return res.status(404).json({ error: 'Event not found' });

        // 因為 Model 現在會回傳 camelCase 的 organizerId，所以這裡可以正確比對了
        if (event.organizerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this event' });
        }

        const updatedEvent = await eventModel.updateEvent(Number(id), {
            name,
            date,
            location,
            description,
            sportType,
            coverImage,
            status
        });

        // 如果沒有任何欄位被更新 (updatedEvent 為 null)，回傳原本的活動資料
        if (!updatedEvent) return res.json(event || null);

        res.json(updatedEvent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete event
export const deleteEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user?.user?.id;

    try {
        // Check if user is the organizer
        const event = await eventModel.getEventById(Number(id));
        if (!event) return res.status(404).json({ error: 'Event not found' });

        if (event.organizerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this event' });
        }

        await eventModel.deleteEvent(Number(id));
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
