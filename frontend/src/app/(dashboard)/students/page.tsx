import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { User } from "@/types";
import { Loader2, Search, Filter, MoreHorizontal, Edit, Trash2, Ban, CheckCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StudentsPage() {
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await apiRequest<{ data: User[] }>("/api/users?role=STUDENT");
            setStudents(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, status: 'ACTIVE' | 'SUSPENDED') => {
        try {
            await apiRequest(`/api/users/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            await fetchStudents();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const filteredStudents = students.filter(student =>
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                <Button>Add Student</Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search students..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Email</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">
                                            {student.profile?.name || "N/A"}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {student.email}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <StatusBadge status={student.status} />
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(student.id)}>
                                                        Copy ID
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                    </DropdownMenuItem>
                                                    {student.status === 'ACTIVE' ? (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(student.id, 'SUSPENDED')} className="text-red-600">
                                                            <Ban className="mr-2 h-4 w-4" /> Suspend
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(student.id, 'ACTIVE')} className="text-green-600">
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Activate
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        ACTIVE: "bg-green-100/50 text-green-700 border-green-200",
        INACTIVE: "bg-gray-100/50 text-gray-700 border-gray-200",
        PENDING: "bg-yellow-100/50 text-yellow-700 border-yellow-200",
        SUSPENDED: "bg-red-100/50 text-red-700 border-red-200",
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status as keyof typeof styles] || styles.INACTIVE}`}>
            {status}
        </span>
    );
}
