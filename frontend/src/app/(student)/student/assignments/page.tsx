'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssignmentSubmissionDialog } from "@/components/assignments/AssignmentSubmissionDialog";
import { Calendar, FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const assignments = [
    {
        id: "1",
        title: "Quantum Mechanics Problem Set 1",
        description: "Solve the problems related to wave functions and potential wells.",
        deadline: "2024-02-28",
        totalMarks: 50,
        status: "PENDING",
        batch: "Physics-2024-A"
    },
    {
        id: "2",
        title: "Calculus III - Midterm Take-home",
        description: "Comprehensive assignment covering multiple integrals.",
        deadline: "2024-02-25",
        totalMarks: 100,
        status: "SUBMITTED",
        batch: "Math-2024-B",
        submittedAt: "2024-02-18"
    },
    {
        id: "3",
        title: "English Essay: Post-Modernism",
        description: "Write a 2000-word essay on post-modernist themes in literature.",
        deadline: "2024-03-05",
        totalMarks: 20,
        status: "GRADED",
        batch: "English-Lit-C",
        marks: 18
    }
];

export default function StudentAssignmentsPage() {
    const handleSubmission = (assignmentId: string, file: File) => {
        console.log(`Submitting assignment ${assignmentId}:`, file.name);
        alert(`Assignment submitted successfully!`);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>

            <div className="grid gap-6">
                {assignments.map((assignment) => (
                    <Card key={assignment.id}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0">
                            <div className="space-y-1">
                                <CardTitle className="text-xl">{assignment.title}</CardTitle>
                                <CardDescription>{assignment.batch}</CardDescription>
                            </div>
                            <Badge variant={
                                assignment.status === 'GRADED' ? 'default' :
                                    assignment.status === 'SUBMITTED' ? 'secondary' : 'destructive'
                            }>
                                {assignment.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm border-l-4 border-muted pl-4 mb-4">
                                {assignment.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Deadline: {new Date(assignment.deadline).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>Total Marks: {assignment.totalMarks}</span>
                                </div>
                                {assignment.status === 'GRADED' && (
                                    <div className="flex items-center gap-1 text-green-600 font-bold">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Marks: {assignment.marks}/{assignment.totalMarks}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center border-t pt-4">
                            {assignment.status === 'PENDING' ? (
                                <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Action Required</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                    {assignment.submittedAt && (
                                        <span>Submitted on: {new Date(assignment.submittedAt).toLocaleDateString()}</span>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm">View Instructions</Button>
                                {assignment.status === 'PENDING' && (
                                    <AssignmentSubmissionDialog
                                        assignmentId={assignment.id}
                                        assignmentTitle={assignment.title}
                                        onSubmit={(file) => handleSubmission(assignment.id, file)}
                                    />
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
