'use client';

import { Assignment } from '@/services/assignments.service';
import Link from 'next/link';
import { format } from 'date-fns';
import { FileText, MoreVertical, Pencil, Trash } from 'lucide-react';

interface AssignmentsTableProps {
    assignments: Assignment[];
}

export function AssignmentsTable({ assignments }: AssignmentsTableProps) {
    if (assignments.length === 0) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border bg-background p-8 text-center animate-in fade-in-50">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No assignments found</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    You haven't created any assignments yet.
                </p>
                <Link
                    href="/assignments/create"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                    Create Assignment
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Batch</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Deadline</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Marks</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {assignments.map((assignment) => (
                        <tr
                            key={assignment.id}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                            <td className="p-4 align-middle">
                                <div className="font-medium">{assignment.title}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {assignment.description}
                                </div>
                            </td>
                            <td className="p-4 align-middle">{assignment.batch?.name || 'N/A'}</td>
                            <td className="p-4 align-middle">
                                {format(new Date(assignment.deadline), 'MMM d, yyyy HH:mm')}
                            </td>
                            <td className="p-4 align-middle">{assignment.total_marks}</td>
                            <td className="p-4 align-middle">
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/assignments/${assignment.id}`}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">View</span>
                                    </Link>
                                    <Link
                                        href={`/assignments/${assignment.id}/edit`}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
