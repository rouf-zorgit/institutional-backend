'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const attendanceRecords = [
    { date: "2024-02-15", status: "PRESENT", batch: "Physics-2024-A" },
    { date: "2024-02-14", status: "ABSENT", batch: "Math-2024-B" },
    { date: "2024-02-13", status: "PRESENT", batch: "Physics-2024-A" },
    { date: "2024-02-12", status: "PRESENT", batch: "English-Lit-C" },
    { date: "2024-02-11", status: "PRESENT", batch: "Physics-2024-A" },
];

export default function StudentAttendancePage() {
    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length;
    const attendancePercentage = (presentCount / totalSessions) * 100;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attendancePercentage.toFixed(1)}%</div>
                        <Progress value={attendancePercentage} className="h-2 mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSessions}</div>
                        <p className="text-xs text-muted-foreground mt-1">last 30 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Days Present</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{presentCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detailed History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendanceRecords.map((record, index) => (
                                <TableRow key={index}>
                                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{record.batch}</TableCell>
                                    <TableCell>
                                        <Badge variant={record.status === 'PRESENT' ? 'default' : 'destructive'}>
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
