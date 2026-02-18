import { apiRequest } from '@/lib/api';

export interface Enrollment {
    id: string;
    student_id: string;
    batch_id: string;
    status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
    enrolled_at: string;
    batch: {
        id: string;
        name: string;
        course: {
            id: string;
            name: string;
            description: string;
        };
        teacher: {
            id: string;
            profile?: {
                name: string;
            };
        };
    };
}

export const EnrollmentService = {
    getStudentEnrollments: async (token?: string) => {
        return apiRequest<{ success: boolean; data: Enrollment[] }>('/api/v1/enrollment/student', {
            token
        });
    },

    enroll: async (batchId: string, token?: string) => {
        return apiRequest<{ success: boolean; data: Enrollment }>('/api/v1/enrollment', {
            method: 'POST',
            body: JSON.stringify({ batch_id: batchId }),
            token
        });
    },
};
