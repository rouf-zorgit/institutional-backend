import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Loader2, Plus, Edit, Trash2, Search, Filter, MoreHorizontal, BookOpen } from "lucide-react";
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

interface Course {
    id: string;
    title: string;
    description: string;
    duration: string;
    price: number;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    created_at: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await apiRequest<{ data: Course[] }>("/api/courses");
            setCourses(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this course?")) return;
        try {
            await apiRequest(`/api/courses/${id}`, { method: "DELETE" });
            fetchCourses();
        } catch (error) {
            console.error("Failed to delete course:", error);
            alert("Failed to delete course");
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
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
                <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Course
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search courses..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCourses.map((course) => (
                    <div key={course.id} className="group relative rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flexh-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(course.id)} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <h3 className="mt-4 font-semibold text-lg leading-tight">{course.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {course.description || "No description provided."}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-sm">
                            <Badge status={course.status} />
                            <span className="font-medium">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(course.price)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {filteredCourses.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No courses found.
                </div>
            )}
        </div>
    );
}

function Badge({ status }: { status: string }) {
    const styles = {
        PUBLISHED: "bg-green-100/50 text-green-700 border-green-200",
        DRAFT: "bg-gray-100/50 text-gray-700 border-gray-200",
        ARCHIVED: "bg-yellow-100/50 text-yellow-700 border-yellow-200",
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status as keyof typeof styles] || styles.DRAFT}`}>
            {status}
        </span>
    );
}
