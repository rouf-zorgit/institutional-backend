import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { status } = await request.json();
        const { id } = params;

        // Validate status
        const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        const student = await prisma.user.update({
            where: { id },
            data: { status },
            include: {
                profile: true,
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                user_id: id,
                action: 'STATUS_UPDATED',
                entity: 'user',
                entity_id: id,
                new_value: { status },
            },
        });

        return NextResponse.json({ success: true, data: student });
    } catch (error) {
        console.error('Failed to update status:', error);
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 500 }
        );
    }
}
