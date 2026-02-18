"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AssignmentsService, Assignment } from "@/services/assignments.service";
import { SubmissionsService, Submission } from "@/services/submissions.service";
import { getUserFromToken, AuthUser } from "@/lib/auth"; // Ensure this helper exists and parses token
import { Loader2, Calendar, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubmitAssignmentForm } from "@/components/assignments/SubmitAssignmentForm";
import { SubmissionsList } from "@/components/assignments/SubmissionsList";
import { cookies } from "next/headers"; // Can't use in client component
import { getCookie } from "cookies-next"; // Or just document.cookie

export default function AssignmentDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [mySubmission, setMySubmission] = useState<Submission | null>(null);

    useEffect(() => {
        // Get user from token
        const token = getCookie('access_token');
        if (token) {
            const userData = getUserFromToken(token as string);
            setUser(userData);
        }

        if (id) {
            fetchAssignment();
        }
    }, [id]);

    useEffect(() => {
        if (user && user.role === 'STUDENT' && id) {
            fetchMySubmission();
        }
    }, [user, id]);

    const fetchAssignment = async () => {
        setLoading(true);
        try {
            const response = await AssignmentsService.getById(id);
            setAssignment(response.data);
        } catch (error) {
            console.error("Failed to fetch assignment:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMySubmission = async () => {
        try {
            // We need an endpoint to get MY submission for this assignment
            // Or just filter from list? filtering is better for now if API allows it
            // SubmissionsService.getAll({ assignment_id: id, student_id: user.id })
            // Ideally backend should have /assignments/:id/my-submission or similar
            // For now, let's assume getAll works and filters by student_id if we pass it, 
            // OR if we are student, getAll might strictly return OWN submissions only (which is secure)
            if (!user) return;

            const response = await SubmissionsService.getAll({ assignment_id: id, student_id: user.sub }); // user.sub is ID
            if (response.success && Array.isArray(response.data) && response.data.length > 0) {
                setMySubmission(response.data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch my submission:", error);
        }
    };

    const handleSubmissionSuccess = () => {
        fetchMySubmission();
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!assignment) {
        return <div className="p-12 text-center">Assignment not found.</div>;
    }

    const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const isStudent = user?.role === 'STUDENT';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{assignment.title}</h1>
                    <div className="text-muted-foreground mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {format(new Date(assignment.deadline), "MMM d, yyyy")}
                        </span>
                        <Badge variant={new Date(assignment.deadline) < new Date() ? "secondary" : "outline"}>
                            {new Date(assignment.deadline) < new Date() ? "Closed" : "Open"}
                        </Badge>
                        <Badge variant="outline">
                            Total Marks: {assignment.total_marks}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="whitespace-pre-wrap">{assignment.description}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {assignment.file_url && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Assignment Material
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" asChild>
                                    <a href={assignment.file_url} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Attachment
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {isTeacher && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Submissions</CardTitle>
                                <CardDescription>Manage and grade student submissions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SubmissionsList assignmentId={assignment.id} />
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="md:col-span-1">
                    {isStudent && (
                        <Card>
                            <CardHeader>
                                <CardTitle>My Submission</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {mySubmission ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-muted rounded-md text-sm">
                                            <div className="font-semibold mb-1">Status: Submitted</div>
                                            <div className="text-muted-foreground">
                                                Submitted on {format(new Date(mySubmission.submitted_at), "MMM d, yyyy HH:mm")}
                                            </div>
                                            {mySubmission.marks !== undefined && mySubmission.marks !== null && (
                                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                    <div className="font-semibold text-green-600">
                                                        Marks: {mySubmission.marks} / {assignment.total_marks}
                                                    </div>
                                                    {mySubmission.feedback && (
                                                        <div className="mt-1">
                                                            <div className="font-medium text-xs uppercase text-muted-foreground">Feedback:</div>
                                                            <div className="text-muted-foreground">{mySubmission.feedback}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <Button variant="outline" className="w-full" asChild>
                                            <a href={mySubmission.file_url} target="_blank" rel="noopener noreferrer">
                                                View My File
                                            </a>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Upload your assignment file here. Make sure to submit before the deadline.
                                        </p>
                                        <SubmitAssignmentForm
                                            assignmentId={assignment.id}
                                            onSuccess={handleSubmissionSuccess}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
