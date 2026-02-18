'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { VirtualizedTable } from './VirtualizedTable';
import { useInfiniteStudents } from '@/lib/hooks/useInfiniteStudents';
import { useStudentMutation } from '@/lib/hooks/useStudentMutation';

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

interface StudentsTableProps {
    initialData: {
        data: Student[];
        nextCursor: string | null;
        hasMore: boolean;
    };
}

export function StudentsTable({ initialData }: StudentsTableProps) {
    // Infinite query with cursor pagination
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteStudents(initialData);

    // Flatten all pages into single array
    const students = useMemo(
        () => data?.pages.flatMap((page) => page.data) ?? [],
        [data]
    );

    // Mutation hook for optimistic updates
    const { updateStatus } = useStudentMutation();

    // Column definitions
    const columns = useMemo<ColumnDef<Student>[]>(
        () => [
            {
                accessorKey: 'profile.name',
                header: 'Name',
                size: 200,
                cell: ({ row }) => (
                    <div className="font-medium text-gray-900">
                        {row.original.profile.name}
                    </div>
                ),
            },
            {
                accessorKey: 'email',
                header: 'Email',
                size: 250,
                cell: ({ row }) => (
                    <div className="text-gray-600">{row.original.email}</div>
                ),
            },
            {
                accessorKey: 'profile.phone',
                header: 'Phone',
                size: 150,
                cell: ({ row }) => (
                    <div className="text-gray-600">
                        {row.original.profile.phone || '-'}
                    </div>
                ),
            },
            {
                accessorKey: 'enrollments',
                header: 'Courses',
                size: 200,
                cell: ({ row }) => {
                    const enrollments = row.original.enrollments;
                    return (
                        <div className="flex flex-wrap gap-1">
                            {enrollments.slice(0, 2).map((enrollment, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                    {enrollment.batch.course.title}
                                </span>
                            ))}
                            {enrollments.length > 2 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                    +{enrollments.length - 2}
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'status',
                header: 'Status',
                size: 120,
                cell: ({ row }) => {
                    const status = row.original.status;
                    const colors = {
                        ACTIVE: 'bg-green-100 text-green-800',
                        PENDING: 'bg-yellow-100 text-yellow-800',
                        INACTIVE: 'bg-gray-100 text-gray-800',
                        SUSPENDED: 'bg-red-100 text-red-800',
                    };
                    return (
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.INACTIVE
                                }`}
                        >
                            {status}
                        </span>
                    );
                },
            },
            {
                id: 'actions',
                header: 'Actions',
                size: 150,
                cell: ({ row }) => {
                    const student = row.original;
                    return (
                        <div className="flex gap-2">
                            {student.status === 'PENDING' && (
                                <button
                                    onClick={() =>
                                        updateStatus.mutate({
                                            id: student.id,
                                            status: 'ACTIVE',
                                        })
                                    }
                                    disabled={updateStatus.isPending}
                                    className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Activate
                                </button>
                            )}
                            {student.status === 'ACTIVE' && (
                                <button
                                    onClick={() =>
                                        updateStatus.mutate({
                                            id: student.id,
                                            status: 'INACTIVE',
                                        })
                                    }
                                    disabled={updateStatus.isPending}
                                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Deactivate
                                </button>
                            )}
                        </div>
                    );
                },
            },
        ],
        [updateStatus]
    );

    return (
        <div className="space-y-4">
            <VirtualizedTable data={students} columns={columns} />

            {/* Load More Button */}
            {hasNextPage && (
                <div className="flex justify-center">
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isFetchingNextPage ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
}
