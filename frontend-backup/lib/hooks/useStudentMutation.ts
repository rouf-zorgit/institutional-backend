'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateStatusParams {
    id: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

async function updateStudentStatus({ id, status }: UpdateStatusParams) {
    const response = await fetch(`/api/students/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update status');
    }

    return response.json();
}

export function useStudentMutation() {
    const queryClient = useQueryClient();

    const updateStatus = useMutation({
        mutationFn: updateStudentStatus,

        // OPTIMISTIC UPDATE - Update UI immediately
        onMutate: async ({ id, status }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['students'] });

            // Snapshot previous value
            const previousData = queryClient.getQueryData(['students']);

            // Optimistically update cache
            queryClient.setQueryData(['students'], (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((student: any) =>
                            student.id === id
                                ? { ...student, status }
                                : student
                        ),
                    })),
                };
            });

            // Return context with snapshot
            return { previousData };
        },

        // ROLLBACK on error
        onError: (error, variables, context) => {
            // Restore previous data
            if (context?.previousData) {
                queryClient.setQueryData(['students'], context.previousData);
            }

            // Show error notification
            console.error('Failed to update student status:', error);
            alert(`Failed to update status: ${error.message}`);
        },

        // Refetch on success (ensures sync with server)
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });

    return { updateStatus };
}
