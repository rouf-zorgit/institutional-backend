'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    Settings,
    FileText,
    CreditCard,
    UserCheck,
    BarChart,
    ShieldAlert
} from 'lucide-react';

const sidebarItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/registrations', label: 'Registrations', icon: FileText },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/batches', label: 'Batches', icon: Calendar },
    { href: '/attendance', label: 'Attendance', icon: UserCheck },
    { href: '/assignments', label: 'Assignments', icon: FileText },
    { href: '/study-materials', label: 'Study Materials', icon: BookOpen },
    { href: '/payments', label: 'Payments', icon: CreditCard },
    { href: '/financial-reports', label: 'Financial Reports', icon: BarChart },
    { href: '/audit-logs', label: 'Audit Logs', icon: ShieldAlert },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
            <div className="flex h-14 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-6 w-6" />
                    <span>Institute Manager</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
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
