import { apiRequest } from '@/lib/api';

export interface Submission {
    id: string;
    assignment_id: string;
    student_id: string;
    file_url: string;
    submitted_at: string;
    marks?: number;
    feedback?: string;
    student?: {
        profile?: {
            name: string;
        };
        email: string;
    };
}

export interface CreateSubmissionData {
    assignment_id: string;
    file_url: string;
}

export interface GradeSubmissionData {
    marks: number;
    feedback?: string;
}

export const SubmissionsService = {
    getAll: async (params?: { assignment_id?: string; student_id?: string }, token?: string) => {
        const searchParams = new URLSearchParams();
        if (params?.assignment_id) searchParams.append('assignment_id', params.assignment_id);
        if (params?.student_id) searchParams.append('student_id', params.student_id);

        return apiRequest<{ success: boolean; data: Submission[] }>(
            `/api/v1/submissions?${searchParams.toString()}`,
            { token }
        );
    },

    create: async (data: CreateSubmissionData, token?: string) => {
        return apiRequest<{ success: boolean; data: Submission }>('/api/v1/submissions', {
            method: 'POST',
            body: JSON.stringify(data),
            token
        });
    },

    grade: async (id: string, data: GradeSubmissionData, token?: string) => {
        return apiRequest<{ success: boolean; data: Submission }>(`/api/v1/submissions/${id}/grade`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            token
        });
    },
};
