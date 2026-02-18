import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '50');

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

        return NextResponse.json({
            data,
            nextCursor,
            hasMore,
        });
    } catch (error) {
        console.error('Failed to fetch students:', error);
        return NextResponse.json(
            { error: 'Failed to fetch students' },
            { status: 500 }
        );
    }
}
