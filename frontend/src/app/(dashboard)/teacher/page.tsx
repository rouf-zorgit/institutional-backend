import { BatchesService, Batch } from '@/services/batches.service';
import { AssignmentsService, Assignment } from '@/services/assignments.service';
import { ReportingService, TeacherStats } from '@/services/reporting.service';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Users, BookOpen, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function TeacherDashboardPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    let batches: Batch[] = [];
    let assignments: Assignment[] = [];
    let stats: TeacherStats = { totalStudents: 0, pendingGrading: 0 };

    // Fetch data in parallel
    try {
        const [batchesRes, assignmentsRes, statsRes] = await Promise.all([
            BatchesService.getAll({ limit: 5 }, accessToken),
            AssignmentsService.getAll({ limit: 5 }, accessToken),
            ReportingService.getTeacherStats(accessToken)
        ]);

        if (batchesRes.success) batches = batchesRes.data.batches;
        if (assignmentsRes.success) assignments = assignmentsRes.data.assignments;
        if (statsRes.success) stats = statsRes.data;

    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here's an overview of your activity.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{batches.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Assignments</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assignments.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Across all batches</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingGrading}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Batches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {batches.map((batch) => (
                                <div key={batch.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">{batch.name}</p>
                                        <p className="text-sm text-muted-foreground">Course ID: {batch.course_id}</p>
                                    </div>
                                    <Link href={`/batches/${batch.id}`} className="text-sm text-primary hover:underline">
                                        View
                                    </Link>
                                </div>
                            ))}
                            {batches.length === 0 && <p className="text-sm text-muted-foreground">No batches found.</p>}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {assignments.map((assignment) => (
                                <div key={assignment.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium truncate max-w-[150px]">{assignment.title}</p>
                                        <p className="text-sm text-muted-foreground">{assignment.batch?.name}</p>
                                    </div>
                                    <Link href={`/assignments/${assignment.id}`} className="text-sm text-primary hover:underline">
                                        View
                                    </Link>
                                </div>
                            ))}
                            {assignments.length === 0 && <p className="text-sm text-muted-foreground">No assignments found.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
