export interface Event {
    id: number;
    name: string;
    date: string;
    location: string;
    description?: string;
    sport_type?: string;
    cover_image?: string;
    max_participants?: number;
    status: string;
    organizer_id: number;
    created_at: string;
}

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
    const createEvent = async (eventData: any) => {
        try {
            const data = await $fetch(`${config.public.apiBase}/events`, {
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
    const updateEvent = async (id: string, eventData: any) => {
        try {
            const data = await $fetch(`${config.public.apiBase}/events/${id}`, {
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
