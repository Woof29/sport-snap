export interface Event {
    id: number;
    name: string;
    date: string | Date;
    location: string;
    description?: string;
    sportType?: string;
    coverImage?: string;
    status: string;
    organizerId: number;
    createdAt: string | Date;
}

export interface CreateEventRequest {
    name: string;
    date: string | Date;
    location: string;
    description?: string;
    sportType?: string;
    coverImage?: string;
    status?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}
