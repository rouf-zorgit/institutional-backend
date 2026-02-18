import { apiRequest } from '@/lib/api';

export interface TeacherStats {
    totalStudents: number;
    pendingGrading: number;
}

export const ReportingService = {
    getTeacherStats: async (token?: string) => {
        return apiRequest<{ success: boolean; data: TeacherStats }>('/api/v1/reports/teacher-stats', {
            token
        });
    }
};
