"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Loader2, DollarSign, TrendingUp, CreditCard, Users, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface PaymentAnalytics {
    total: {
        amount: number;
        count: number;
    };
    byStatus: {
        status: string;
        amount: number;
        count: number;
    }[];
    monthlyRevenue: {
        month: string;
        amount: number;
    }[];
    topStudents: {
        studentId: string;
        totalPaid: number;
    }[];
}

interface Student {
    id: string;
    profile?: { name: string };
    email: string;
}

export default function FinancialReportsPage() {
    const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Record<string, Student>>({});

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await apiRequest<{ data: PaymentAnalytics }>("/api/reports/payments");
            const data = response.data;
            setAnalytics(data);

            // Fetch student details for top students
            if (data.topStudents.length > 0) {
                // Fetch all students and create a map (optimization: better to support bulk fetch by IDs)
                // For now, we'll fetch all students if list is small, or individual.
                // Given the API limitations, let's fetch all active students.
                const studentsRes = await apiRequest<{ data: Student[] }>("/api/users?role=STUDENT");
                const studentMap: Record<string, Student> = {};
                if (Array.isArray(studentsRes.data)) {
                    studentsRes.data.forEach(s => studentMap[s.id] = s);
                }
                setStudents(studentMap);
            }
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await apiRequest<{ data: string }>("/api/reports/export/payments");
            // Handle CSV download
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payments_report_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export report.");
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!analytics) {
        return <div>Failed to load data</div>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const pieData = analytics.byStatus.map((item) => ({
        name: item.status,
        value: item.amount
    }));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
                    <p className="text-muted-foreground">Overview of revenue, payments, and financial health.</p>
                </div>
                <Button onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(analytics.total.amount)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.total.count} total transactions
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics.byStatus.find(s => s.status === 'PENDING')?.count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting approval
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Monthly Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={analytics.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(value as number)} />
                                <Bar dataKey="amount" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Revenue by Status</CardTitle>
                        <CardDescription>
                            Distribution of payment statuses by amount
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(value as number)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Contributing Students</CardTitle>
                    <CardDescription>
                        Students with the highest total payments.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {analytics.topStudents.map((item, index) => {
                            const student = students[item.studentId];
                            return (
                                <div key={item.studentId} className="flex items-center">
                                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-muted font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{student?.profile?.name || "Unknown Student"}</p>
                                        <p className="text-xs text-muted-foreground">{student?.email || item.studentId}</p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(item.totalPaid)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
