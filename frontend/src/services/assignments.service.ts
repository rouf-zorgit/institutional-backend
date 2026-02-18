import { apiRequest } from '@/lib/api';

export interface Assignment {
    id: string;
    title: string;
    description: string;
    deadline: string;
    total_marks: number;
    file_url?: string;
    batch_id: string;
    created_by: string;
    created_at: string;
    batch?: {
        id: string;
        name: string;
    };
    submissions?: any[]; // refine type later
}

export interface CreateAssignmentData {
    batch_id: string;
    title: string;
    description: string;
    deadline: string;
    total_marks: number;
    file_url?: string;
}

export const AssignmentsService = {
    getAll: async (params?: { batch_id?: string; teacher_id?: string; page?: number; limit?: number }, token?: string) => {
        const searchParams = new URLSearchParams();
        if (params?.batch_id) searchParams.append('batch_id', params.batch_id);
        if (params?.teacher_id) searchParams.append('teacher_id', params.teacher_id);
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());

        return apiRequest<{ success: boolean; data: { assignments: Assignment[]; meta: any } }>(
            `/api/v1/assignments?${searchParams.toString()}`,
            { token }
        );
    },

    getById: async (id: string, token?: string) => {
        return apiRequest<{ success: boolean; data: Assignment }>(`/api/v1/assignments/${id}`, { token });
    },

    create: async (data: CreateAssignmentData, token?: string) => {
        return apiRequest<{ success: boolean; data: Assignment }>('/api/v1/assignments', {
            method: 'POST',
            body: JSON.stringify(data),
            token
        });
    },

    update: async (id: string, data: Partial<CreateAssignmentData>, token?: string) => {
        return apiRequest<{ success: boolean; data: Assignment }>(`/api/v1/assignments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            token
        });
    },

    delete: async (id: string, token?: string) => {
        return apiRequest<{ success: true; message: string }>(`/api/v1/assignments/${id}`, {
            method: 'DELETE',
            token
        });
    },

    // Add grading and submission methods later as needed
};
