import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Loader2, Plus, Calendar, Edit, Trash2, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface Batch {
    id: string;
    name: string;
    course_id: string;
    course: { title: string };
    teacher_id: string;
    teacher: { profile?: { name: string }, email: string };
    capacity: number;
    start_date: string;
    end_date: string;
    status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    _count?: {
        enrollments: number;
    };
}

export default function BatchesPage() {
    const router = useRouter();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const response = await apiRequest<{ data: Batch[] }>("/api/batches");
            setBatches(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch batches:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this batch?")) return;
        try {
            await apiRequest(`/api/batches/${id}`, { method: "DELETE" });
            fetchBatches();
        } catch (error) {
            console.error("Failed to delete batch:", error);
            alert("Failed to delete batch");
        }
    };

    const filteredBatches = batches.filter(batch =>
        batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.course.title.toLowerCase().includes(searchQuery.toLowerCase())
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
                <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
                <Button onClick={() => router.push("/batches/create")}>
                    <Plus className="mr-2 h-4 w-4" /> Create Batch
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search batches..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Batch Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Course</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Teacher</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Schedule</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Enrollment</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredBatches.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                        No batches found.
                                    </td>
                                </tr>
                            ) : (
                                filteredBatches.map((batch) => (
                                    <tr key={batch.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">
                                            {batch.name}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {batch.course.title}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-3 w-3 text-muted-foreground" />
                                                <span>{batch.teacher?.profile?.name || batch.teacher?.email || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            <div className="flex flex-col text-xs">
                                                <span>{format(new Date(batch.start_date), "MMM d")} - {format(new Date(batch.end_date), "MMM d, yyyy")}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{ width: `${Math.min(((batch._count?.enrollments || 0) / batch.capacity) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {batch._count?.enrollments || 0}/{batch.capacity}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <StatusBadge status={batch.status} />
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
                                                    <DropdownMenuItem onClick={() => router.push(`/batches/${batch.id}/edit`)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(batch.id)} className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
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
        UPCOMING: "bg-blue-100/50 text-blue-700 border-blue-200",
        ONGOING: "bg-green-100/50 text-green-700 border-green-200",
        COMPLETED: "bg-gray-100/50 text-gray-700 border-gray-200",
        CANCELLED: "bg-red-100/50 text-red-700 border-red-200",
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
            {status}
        </span>
    );
}
