'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

interface Student {
    id: string;
    email: string;
    status: string;
    profile: {
        name: string;
        phone?: string;
    };
    enrollments: Array<{
        batch: {
            course: {
                title: string;
            };
        };
    }>;
    created_at: string;
}

interface StudentsResponse {
    data: Student[];
    nextCursor: string | null;
    hasMore: boolean;
}

async function fetchStudents({ cursor }: { cursor?: string }): Promise<StudentsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    params.set('limit', '50');

    const response = await fetch(`/api/students?${params}`);
    if (!response.ok) throw new Error('Failed to fetch students');

    const result = await response.json();
    return result;
}

export function useInfiniteStudents(initialData: StudentsResponse) {
    return useInfiniteQuery({
        queryKey: ['students'],
        queryFn: ({ pageParam }) => fetchStudents({ cursor: pageParam }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        initialData: {
            pages: [initialData],
            pageParams: [undefined],
        },
    });
}
