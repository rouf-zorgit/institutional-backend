import { AssignmentsService } from '@/services/assignments.service';
import { AssignmentsTable } from '@/components/assignments/AssignmentsTable';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function AssignmentsPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    let assignments = [];
    try {
        const response = await AssignmentsService.getAll({}, accessToken);
        if (response.success) {
            assignments = response.data.assignments;
        }
    } catch (error) {
        console.error('Failed to fetch assignments:', error);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
                    <p className="text-muted-foreground">
                        Manage and grade student assignments.
                    </p>
                </div>
                <Link
                    href="/assignments/create"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                </Link>
            </div>

            <AssignmentsTable assignments={assignments} />
        </div>
    );
}
