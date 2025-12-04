import express from 'express';
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', authenticateToken, requireRole(['admin', 'organizer']), createEvent);
router.put('/:id', authenticateToken, requireRole(['admin', 'organizer']), updateEvent);
router.delete('/:id', authenticateToken, requireRole(['admin', 'organizer']), deleteEvent);

export default router;
