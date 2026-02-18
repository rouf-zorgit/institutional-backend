"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Loader2, Calendar, Check, X, Clock, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Batch {
    id: string;
    name: string;
    course: { title: string };
}

interface Student {
    id: string;
    email: string;
    profile?: { name: string };
}

interface AttendanceRecord {
    id: string;
    student_id: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    notes?: string;
}

export default function AttendancePage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchBatches();
    }, []);

    useEffect(() => {
        if (selectedBatchId && selectedDate) {
            fetchAttendanceData();
        }
    }, [selectedBatchId, selectedDate]);

    const fetchBatches = async () => {
        try {
            const response = await apiRequest<{ data: Batch[] }>("/api/v1/batches?status=ONGOING");
            setBatches(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch batches:", error);
        }
    };

    const fetchAttendanceData = async () => {
        setLoading(true);
        setMessage(null);
        try {
            // 1. Fetch students in batch
            const enrollmentsRes = await apiRequest<{ data: any[] }>(`/api/v1/enrollments?batch_id=${selectedBatchId}`);
            const enrolledStudents = Array.isArray(enrollmentsRes.data)
                ? enrollmentsRes.data.map(e => e.student)
                : [];
            setStudents(enrolledStudents);

            // 2. Fetch existing attendance for date
            const attendanceRes = await apiRequest<{ data: AttendanceRecord[] }>(`/api/v1/attendance/batch/${selectedBatchId}/date/${selectedDate}`);
            const existingRecords = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];

            // 3. Merge data
            const initialAttendance: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};

            // Default to PRESENT for new records, or use existing status
            enrolledStudents.forEach(student => {
                const record = existingRecords.find(r => r.student_id === student.id);
                initialAttendance[student.id] = record ? record.status : 'PRESENT';
            });

            setAttendanceData(initialAttendance);
        } catch (error) {
            console.error("Failed to fetch attendance data:", error);
            setMessage({ type: 'error', text: "Failed to load attendance data." });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSave = async () => {
        if (!selectedBatchId) return;
        setSaving(true);
        setMessage(null);

        try {
            const records = Object.entries(attendanceData).map(([studentId, status]) => ({
                student_id: studentId,
                status
            }));

            await apiRequest("/api/v1/attendance/bulk-mark", {
                method: "POST",
                body: JSON.stringify({
                    batch_id: selectedBatchId,
                    date: selectedDate,
                    records
                })
            });

            setMessage({ type: 'success', text: "Attendance saved successfully." });
        } catch (error) {
            console.error("Failed to save attendance:", error);
            setMessage({ type: 'error', text: "Failed to save attendance." });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Mark Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Select Batch</label>
                            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a batch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {batches.map((batch) => (
                                        <SelectItem key={batch.id} value={batch.id}>
                                            {batch.name} ({batch.course.title})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 min-w-[200px]">
                            <label className="text-sm font-medium">Select Date</label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {selectedBatchId && (
                        <>
                            {loading ? (
                                <div className="flex h-48 items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : students.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg">
                                    No students enrolled in this batch.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-md border">
                                        <table className="w-full caption-bottom text-sm text-left">
                                            <thead className="bg-muted/50 [&_tr]:border-b">
                                                <tr className="border-b transition-colors">
                                                    <th className="h-12 px-4 align-middle font-medium">Student Name</th>
                                                    <th className="h-12 px-4 align-middle font-medium text-center w-[300px]">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="[&_tr:last-child]:border-0">
                                                {students.map((student) => (
                                                    <tr key={student.id} className="border-b transition-colors hover:bg-muted/50">
                                                        <td className="p-4 align-middle font-medium">
                                                            {student.profile?.name || "N/A"}
                                                            <div className="text-xs text-muted-foreground font-normal">{student.email}</div>
                                                        </td>
                                                        <td className="p-4 align-middle">
                                                            <div className="flex justify-center gap-2">
                                                                <StatusButton
                                                                    status="PRESENT"
                                                                    current={attendanceData[student.id]}
                                                                    onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                                    icon={<Check className="h-4 w-4" />}
                                                                    label="Present"
                                                                />
                                                                <StatusButton
                                                                    status="ABSENT"
                                                                    current={attendanceData[student.id]}
                                                                    onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                                    icon={<X className="h-4 w-4" />}
                                                                    label="Absent"
                                                                />
                                                                <StatusButton
                                                                    status="LATE"
                                                                    current={attendanceData[student.id]}
                                                                    onClick={() => handleStatusChange(student.id, 'LATE')}
                                                                    icon={<Clock className="h-4 w-4" />}
                                                                    label="Late"
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {message && (
                                        <div className={`p-4 rounded-md flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {message.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                            {message.text}
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4">
                                        <Button onClick={handleSave} disabled={saving} size="lg">
                                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Save Attendance
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function StatusButton({
    status,
    current,
    onClick,
    icon,
    label
}: {
    status: string;
    current: string;
    onClick: () => void;
    icon: React.ReactNode;
    label: string
}) {
    const isSelected = status === current;

    let variantClass = "text-muted-foreground hover:bg-muted";
    if (isSelected) {
        if (status === 'PRESENT') variantClass = "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";
        if (status === 'ABSENT') variantClass = "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
        if (status === 'LATE') variantClass = "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200";
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-transparent",
                variantClass
            )}
        >
            {icon}
            {label}
        </button>
    );
}
