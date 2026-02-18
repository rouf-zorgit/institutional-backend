import { apiRequest } from '@/lib/api';

export interface Batch {
    id: string;
    name: string;
    course_id: string;
    // add other fields as needed
}

export const BatchesService = {
    getAll: async (params?: { course_id?: string; teacher_id?: string; page?: number; limit?: number }, token?: string) => {
        const searchParams = new URLSearchParams();
        if (params?.course_id) searchParams.append('course_id', params.course_id);
        if (params?.teacher_id) searchParams.append('teacher_id', params.teacher_id);
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());

        // Return all batches for dropdowns if no limit specified? 
        // Backend default limit might be 10. We might need a 'all' param or large limit.
        if (!params?.limit) searchParams.append('limit', '100');

        return apiRequest<{ success: boolean; data: { batches: Batch[]; meta: any } }>(
            `/api/v1/batches?${searchParams.toString()}`,
            { token }
        );
    },
};
