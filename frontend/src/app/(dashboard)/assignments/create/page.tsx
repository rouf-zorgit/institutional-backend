import { CreateAssignmentForm } from '@/components/assignments/CreateAssignmentForm';

export default function CreateAssignmentPage() {
    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Assignment</h1>
                <p className="text-muted-foreground">
                    Create a new assignment for a batch.
                </p>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <CreateAssignmentForm />
            </div>
        </div>
    );
}
