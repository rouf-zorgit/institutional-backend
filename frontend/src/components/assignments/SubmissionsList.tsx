"use client";

import { useState, useEffect } from "react";
import { SubmissionsService, Submission } from "@/services/submissions.service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GradeSubmissionDialog } from "./GradeSubmissionDialog";
import { FileIcon, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface SubmissionsListProps {
    assignmentId: string;
}

export function SubmissionsList({ assignmentId }: SubmissionsListProps) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    useEffect(() => {
        fetchSubmissions();
    }, [assignmentId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const response = await SubmissionsService.getAll({ assignment_id: assignmentId });
            setSubmissions(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGraded = () => {
        setSelectedSubmission(null);
        fetchSubmissions();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Submissions ({submissions.length})</h3>

            {loading ? (
                <div>Loading submissions...</div>
            ) : submissions.length === 0 ? (
                <div className="text-muted-foreground">No submissions yet.</div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Submitted At</TableHead>
                                <TableHead>File</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.map((submission) => (
                                <TableRow key={submission.id}>
                                    <TableCell>
                                        <div className="font-medium">{submission.student?.profile?.name || "Unknown"}</div>
                                        <div className="text-xs text-muted-foreground">{submission.student?.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(submission.submitted_at), "MMM d, yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href={submission.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-blue-600 hover:underline"
                                        >
                                            <FileIcon className="h-4 w-4" />
                                            View File
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        {submission.marks !== null && submission.marks !== undefined ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                {submission.marks}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">
                                                Not Graded
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedSubmission(submission)}
                                        >
                                            Grade
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {selectedSubmission && (
                <GradeSubmissionDialog
                    submission={selectedSubmission}
                    open={!!selectedSubmission}
                    onOpenChange={(open) => !open && setSelectedSubmission(null)}
                    onSuccess={handleGraded}
                />
            )}
        </div>
    );
}
