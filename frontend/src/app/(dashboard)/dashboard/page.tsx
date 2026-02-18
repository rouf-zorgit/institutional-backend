import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api";
import { Users, BookOpen, GraduationCap, DollarSign } from "lucide-react";

interface DashboardStats {
    students: {
        total: number;
    };
    courses: {
        total: number;
    };
    batches: {
        total: number;
        active: number;
    };
    enrollments: {
        total: number;
        active: number;
    };
    revenue: {
        total: number;
        pendingPayments: number;
        approvedPayments: number;
        rejectedPayments: number;
    };
}

async function getDashboardStats() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    try {
        const response = await apiRequest<{ success: boolean; data: DashboardStats }>(
            "/api/reports/dashboard",
            { token: accessToken }
        );
        return response.data;
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        return null;
    }
}

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    if (!stats) {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="p-4 text-red-500 border border-red-200 rounded-lg bg-red-50">
                    Failed to load dashboard statistics. Please try again later.
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-gray-500">Total Students</h3>
                        <Users className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex items-center pt-2">
                        <span className="text-2xl font-bold">{stats.students.total}</span>
                    </div>
                </div>

                <div className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-gray-500">Active Courses</h3>
                        <BookOpen className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex items-center pt-2">
                        <span className="text-2xl font-bold">{stats.courses.total}</span>
                    </div>
                </div>

                <div className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-gray-500">Pending Payments</h3>
                        <DollarSign className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex items-center pt-2">
                        <span className="text-2xl font-bold">{stats.revenue.pendingPayments}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                            ({stats.revenue.rejectedPayments} rejected)
                        </span>
                    </div>
                </div>

                <div className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-gray-500">Total Revenue</h3>
                        <DollarSign className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex items-center pt-2">
                        <span className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.revenue.total)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 p-6 bg-white border rounded-xl shadow-sm">
                    <h3 className="font-semibold text-lg mb-4">Enrollment Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium">Active Enrollments</p>
                            <p className="text-2xl font-bold text-blue-900">{stats.enrollments.active}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 font-medium">Total Enrollments</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.enrollments.total}</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Total Batches</p>
                                <p className="text-xl font-semibold">{stats.batches.total}</p>
                            </div>
                            <div>
                                <p className="text-sm text-green-600">Active Batches</p>
                                <p className="text-xl font-semibold text-green-700">{stats.batches.active}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-3 p-6 bg-white border rounded-xl shadow-sm">
                    <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        {/* Links or buttons will go here */}
                        <p className="text-sm text-gray-500">Shortcuts to common tasks will be added here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
