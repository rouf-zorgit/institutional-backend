'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    GraduationCap,
    BookOpen,
    Calendar,
    Settings,
    FileText,
    CreditCard,
    UserCheck,
    Library
} from 'lucide-react';

const studentSidebarItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/courses', label: 'My Courses', icon: BookOpen },
    { href: '/student/attendance', label: 'Attendance', icon: UserCheck },
    { href: '/student/assignments', label: 'Assignments', icon: FileText },
    { href: '/student/study-materials', label: 'Study Materials', icon: Library },
    { href: '/student/payments', label: 'Payments', icon: CreditCard },
    { href: '/student/registration', label: 'Registration', icon: GraduationCap },
    { href: '/student/settings', label: 'Settings', icon: Settings },
];

export function StudentSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
            <div className="flex h-14 items-center border-b px-6">
                <Link href="/student/dashboard" className="flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-6 w-6" />
                    <span>Student Portal</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {studentSidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive
                                        ? "bg-muted text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
