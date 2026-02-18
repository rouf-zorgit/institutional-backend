import { Suspense } from 'react';
import { StudentsTable } from '@/components/students/StudentsTable';
import { prisma } from '@/lib/prisma';

// Server Component - runs on server
export default async function StudentsPage() {
    // Fetch initial data on server
    const initialData = await getStudents({ limit: 50 });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage all students in the system
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <Suspense fallback={<StatsCardsSkeleton />}>
                <StatsCards />
            </Suspense>

            {/* Students Table */}
            <Suspense fallback={<TableSkeleton />}>
                <StudentsTable initialData={initialData} />
            </Suspense>
        </div>
    );
}

// Server action to fetch students
async function getStudents({ limit = 50, cursor }: { limit?: number; cursor?: string }) {
    const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        include: {
            profile: true,
            enrollments: {
                include: {
                    batch: {
                        include: {
                            course: true,
                        },
                    },
                },
            },
        },
        take: limit + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
        orderBy: { created_at: 'desc' },
    });

    const hasMore = students.length > limit;
    const data = hasMore ? students.slice(0, -1) : students;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, nextCursor, hasMore };
}

// Server component for stats
async function StatsCards() {
    const [total, active, pending, inactive] = await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
        prisma.enrollment.count({ where: { status: 'PENDING' } }),
        prisma.user.count({ where: { role: 'STUDENT', status: 'INACTIVE' } }),
    ]);

    const stats = [
        { label: 'Total Students', value: total, color: 'blue' },
        { label: 'Active', value: active, color: 'green' },
        { label: 'Pending', value: pending, color: 'yellow' },
        { label: 'Inactive', value: inactive, color: 'gray' },
    ];

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-white overflow-hidden shadow rounded-lg"
                >
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    {stat.label}
                                </dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                    {stat.value.toLocaleString()}
                                </dd>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function StatsCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="space-y-4 bg-white shadow rounded-lg p-6">
            <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
            </div>
        </div>
    );
}
