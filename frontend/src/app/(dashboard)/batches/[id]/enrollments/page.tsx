"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Loader2, ArrowLeft, Plus, Search, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Assuming Badge exists or I'll use custom span

interface Student {
    id: string;
    email: string;
    profile?: {
        name: string;
    };
}

interface Enrollment {
    id: string;
    student: Student;
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    payment_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIAL';
    created_at: string;
}

interface Batch {
    id: string;
    name: string;
    course: { title: string };
    capacity: number;
    _count?: { enrollments: number };
}

export default function BatchEnrollmentsPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = params?.id as string;

    const [batch, setBatch] = useState<Batch | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const [searchStudentQuery, setSearchStudentQuery] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (batchId) {
            fetchData();
        }
    }, [batchId]);

    const fetchData = async () => {
        try {
            const [batchRes, enrollmentsRes, studentsRes] = await Promise.all([
                apiRequest<{ data: Batch }>(`/api/batches/${batchId}`),
                apiRequest<{ data: Enrollment[] }>(`/api/enrollments?batch_id=${batchId}`),
                apiRequest<{ data: Student[] }>(`/api/users?role=STUDENT&status=ACTIVE`)
            ]);

            setBatch(batchRes.data);
            setEnrollments(Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : []);
            setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async () => {
        if (!selectedStudentId) return;
        setActionLoading(true);
        try {
            await apiRequest("/api/enrollments", {
                method: "POST",
                body: JSON.stringify({
                    student_id: selectedStudentId,
                    batch_id: batchId,
                    status: 'ACTIVE'
                })
            });
            setIsAddDialogOpen(false);
            setSelectedStudentId("");
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Failed to enroll student:", error);
            alert("Failed to enroll student. They might already be enrolled.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveStudent = async (enrollmentId: string) => {
        if (!confirm("Are you sure you want to remove this student from the batch?")) return;
        try {
            await apiRequest(`/api/enrollments/${enrollmentId}`, { method: "DELETE" });
            fetchData();
        } catch (error) {
            console.error("Failed to remove student:", error);
            alert("Failed to remove student.");
        }
    };

    const handleStatusUpdate = async (enrollmentId: string, status: string) => {
        try {
            await apiRequest(`/api/enrollments/${enrollmentId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status })
            });
            fetchData();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    // Filter students for the dropdown (exclude already enrolled)
    const enrolledStudentIds = new Set(enrollments.map(e => e.student.id));
    const availableStudents = students.filter(s =>
        !enrolledStudentIds.has(s.id) &&
        (s.profile?.name.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchStudentQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!batch) {
        return <div>Batch not found</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/batches")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{batch.name} - Enrollments</h1>
                    <p className="text-muted-foreground">{batch.course.title} • {enrollments.length} / {batch.capacity} Students</p>
                </div>
                <div className="ml-auto">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={enrollments.length >= batch.capacity}>
                                <Plus className="mr-2 h-4 w-4" /> Add Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Enroll Student</DialogTitle>
                                <DialogDescription>
                                    Select a student to add to this batch.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchStudentQuery}
                                        onChange={(e) => setSearchStudentQuery(e.target.value)}
                                    />
                                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableStudents.map((student) => (
                                                <SelectItem key={student.id} value={student.id}>
                                                    {student.profile?.name || "N/A"} ({student.email})
                                                </SelectItem>
                                            ))}
                                            {availableStudents.length === 0 && (
                                                <div className="p-2 text-sm text-center text-muted-foreground">No students found</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddStudent} disabled={!selectedStudentId || actionLoading}>
                                    {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Enroll
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Student</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Enrolled Date</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Payment</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {enrollments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                            No students enrolled yet.
                                        </td>
                                    </tr>
                                ) : (
                                    enrollments.map((enrollment) => (
                                        <tr key={enrollment.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{enrollment.student.profile?.name || "N/A"}</span>
                                                    <span className="text-xs text-muted-foreground">{enrollment.student.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {new Date(enrollment.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <EnrollmentStatusBadge status={enrollment.status} />
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${enrollment.payment_status === 'APPROVED' ? 'bg-green-100/50 text-green-700 border-green-200' :
                                                        enrollment.payment_status === 'PENDING' ? 'bg-yellow-100/50 text-yellow-700 border-yellow-200' :
                                                            'bg-red-100/50 text-red-700 border-red-200'
                                                    }`}>
                                                    {enrollment.payment_status}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleRemoveStudent(enrollment.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function EnrollmentStatusBadge({ status }: { status: string }) {
    const styles = {
        ACTIVE: "bg-green-100/50 text-green-700 border-green-200",
        PENDING: "bg-yellow-100/50 text-yellow-700 border-yellow-200",
        COMPLETED: "bg-blue-100/50 text-blue-700 border-blue-200",
        CANCELLED: "bg-red-100/50 text-red-700 border-red-200",
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
            {status}
        </span>
    );
}
