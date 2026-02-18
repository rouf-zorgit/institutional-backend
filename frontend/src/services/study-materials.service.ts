import { apiRequest } from '@/lib/api';

export enum MaterialType {
    PDF = 'PDF',
    VIDEO = 'VIDEO',
    NOTE = 'NOTE',
    ASSIGNMENT = 'ASSIGNMENT'
}

export interface StudyMaterial {
    id: string;
    title: string;
    description?: string;
    type: MaterialType;
    file_url: string;
    batch_id: string;
    uploaded_by: string;
    uploaded_at: string;
    batch?: {
        id: string;
        name: string;
    };
    uploader?: {
        id: string;
        email: string;
        profile?: {
            name: string;
        };
    };
}

export interface CreateStudyMaterialData {
    batch_id: string;
    title: string;
    description?: string;
    type: MaterialType;
    file_url: string;
}

export const StudyMaterialsService = {
    getAll: async (params?: { batch_id?: string; page?: number; limit?: number }, token?: string) => {
        const searchParams = new URLSearchParams();
        if (params?.batch_id) searchParams.append('batch_id', params.batch_id);
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());

        return apiRequest<{ success: boolean; data: { materials: StudyMaterial[]; meta: any } }>(
            `/api/v1/study-materials?${searchParams.toString()}`,
            { token }
        );
    },

    create: async (data: CreateStudyMaterialData, token?: string) => {
        return apiRequest<{ success: boolean; data: StudyMaterial }>('/api/v1/study-materials', {
            method: 'POST',
            body: JSON.stringify(data),
            token
        });
    },

    delete: async (id: string, token?: string) => {
        return apiRequest<{ success: true; message: string }>(`/api/v1/study-materials/${id}`, {
            method: 'DELETE',
            token
        });
    },
};
