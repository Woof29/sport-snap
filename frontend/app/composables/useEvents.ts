import type { Event, CreateEventRequest, UpdateEventRequest } from '@shared/types/event';

export const useEvents = () => {
    const config = useRuntimeConfig();
    const auth = useAuth();

    // Get all events
    const getEvents = async () => {
        return await useFetch<Event[]>(`${config.public.apiBase}/events`);
    };

    // Get event by ID
    const getEventById = async (id: string) => {
        return await useFetch<Event>(`${config.public.apiBase}/events/${id}`);
    };

    // Create event
    const createEvent = async (eventData: CreateEventRequest) => {
        try {
            const data = await $fetch<Event>(`${config.public.apiBase}/events`, {
                method: 'POST',
                body: eventData,
                headers: {
                    Authorization: `Bearer ${auth.token.value}`
                }
            });
            return { success: true, data };
        } catch (error: any) {
            return {
                success: false,
                error: error.data?.error || '建立賽事失敗'
            };
        }
    };

    // Update event
    const updateEvent = async (id: string, eventData: UpdateEventRequest) => {
        try {
            const data = await $fetch<Event>(`${config.public.apiBase}/events/${id}`, {
                method: 'PUT',
                body: eventData,
                headers: {
                    Authorization: `Bearer ${auth.token.value}`
                }
            });
            return { success: true, data };
        } catch (error: any) {
            return {
                success: false,
                error: error.data?.error || '更新賽事失敗'
            };
        }
    };

    // Delete event
    const deleteEvent = async (id: string) => {
        try {
            await $fetch(`${config.public.apiBase}/events/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${auth.token.value}`
                }
            });
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.data?.error || '刪除賽事失敗'
            };
        }
    };

    return {
        getEvents,
        getEventById,
        createEvent,
        updateEvent,
        deleteEvent
    };
};
