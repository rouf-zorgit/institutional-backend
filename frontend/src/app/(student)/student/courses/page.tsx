'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, User } from "lucide-react";

// Mock data for initial UI
const studentEnrollments = [
    {
        id: "1",
        batch: {
            name: "Physics-2024-A",
            course: {
                name: "Advanced Physics",
                description: "Mechanics, Electromagnetism, and Quantum Basics."
            },
            teacher: {
                name: "Dr. Sarah Smith"
            }
        },
        status: "ACTIVE",
        enrolled_at: "2024-01-10"
    },
    {
        id: "2",
        batch: {
            name: "Math-2024-B",
            course: {
                name: "Calculus III",
                description: "Multivariable calculus and vector fields."
            },
            teacher: {
                name: "Prof. James Wilson"
            }
        },
        status: "ACTIVE",
        enrolled_at: "2024-01-15"
    }
];

export default function StudentCoursesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                <Button>Browse More Courses</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {studentEnrollments.map((enrollment) => (
                    <Card key={enrollment.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant={enrollment.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {enrollment.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                </span>
                            </div>
                            <CardTitle className="text-xl">{enrollment.batch.course.name}</CardTitle>
                            <CardDescription>{enrollment.batch.course.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Batch:</span> {enrollment.batch.name}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Teacher:</span> {enrollment.batch.teacher.name}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 border-t">
                            <Button variant="outline" className="w-full">View Batch Details</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
