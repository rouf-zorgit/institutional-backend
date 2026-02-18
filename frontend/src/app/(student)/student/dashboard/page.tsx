'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    BookOpen,
    CalendarDays
} from "lucide-react";

export default function StudentDashboard() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">85%</div>
                        <p className="text-xs text-muted-foreground">
                            +2% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">
                            Due within 7 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">
                            currently enrolled
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$150</div>
                        <p className="text-xs text-muted-foreground">
                            Due on Mar 1st
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Mock Activity Items */}
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Assignment Submitted</p>
                                    <p className="text-sm text-muted-foreground">
                                        Physics 101 - Lab Report 3
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-sm text-gray-500">Just now</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Payment Confirmed</p>
                                    <p className="text-sm text-muted-foreground">
                                        Tuition Fee - February
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-sm text-gray-500">2h ago</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Class Schedule Update</p>
                                    <p className="text-sm text-muted-foreground">
                                        Chemistry 202 - Rescheduled to Friday
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-sm text-gray-500">5h ago</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Upcoming Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 border-l-4 border-blue-500 pl-4">
                                <div>
                                    <p className="text-sm font-medium">Mathematics</p>
                                    <p className="text-xs text-muted-foreground">10:00 AM - 11:30 AM</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-l-4 border-green-500 pl-4">
                                <div>
                                    <p className="text-sm font-medium">Physics</p>
                                    <p className="text-xs text-muted-foreground">12:00 PM - 01:30 PM</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-l-4 border-purple-500 pl-4">
                                <div>
                                    <p className="text-sm font-medium">English Literature</p>
                                    <p className="text-xs text-muted-foreground">02:00 PM - 03:30 PM</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
