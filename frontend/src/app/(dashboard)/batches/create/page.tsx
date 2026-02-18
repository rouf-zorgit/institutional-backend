"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Loader2, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Course {
    id: string;
    title: string;
}

interface Teacher {
    id: string;
    profile?: { name: string };
    email: string;
}

export default function CreateBatchPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        course_id: "",
        teacher_id: "",
        capacity: "",
        start_date: "",
        end_date: "",
        class_time: "",
        class_days: [] as string[],
    });

    useEffect(() => {
        fetchDependencies();
    }, []);

    const fetchDependencies = async () => {
        try {
            const [coursesRes, teachersRes] = await Promise.all([
                apiRequest<{ data: Course[] }>("/api/courses?status=PUBLISHED"),
                apiRequest<{ data: Teacher[] }>("/api/users?role=TEACHER&status=ACTIVE"),
            ]);
            setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
            setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
        } catch (error) {
            console.error("Failed to fetch dependencies:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDayChange = (day: string) => {
        setFormData(prev => ({
            ...prev,
            class_days: prev.class_days.includes(day)
                ? prev.class_days.filter(d => d !== day)
                : [...prev.class_days, day]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiRequest("/api/batches", {
                method: "POST",
                body: JSON.stringify({
                    ...formData,
                    capacity: Number(formData.capacity),
                    start_date: new Date(formData.start_date).toISOString(),
                    end_date: new Date(formData.end_date).toISOString(),
                }),
            });
            router.push("/batches");
        } catch (error) {
            console.error("Failed to create batch:", error);
            alert("Failed to create batch. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Create New Batch</h1>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Batch Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Summer 2024 - Batch A"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="course_id">Course</Label>
                                <Select
                                    value={formData.course_id}
                                    onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teacher_id">Teacher</Label>
                                <Select
                                    value={formData.teacher_id}
                                    onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                {teacher.profile?.name || teacher.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    name="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    name="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input
                                    id="capacity"
                                    name="capacity"
                                    type="number"
                                    min="1"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="class_time">Class Time</Label>
                                <Input
                                    id="class_time"
                                    name="class_time"
                                    type="time"
                                    value={formData.class_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Class Days</Label>
                            <div className="flex flex-wrap gap-4">
                                {days.map((day) => (
                                    <div key={day} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={day}
                                            checked={formData.class_days.includes(day)}
                                            onCheckedChange={() => handleDayChange(day)}
                                        />
                                        <Label htmlFor={day} className="text-sm font-normal">{day}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Create Batch
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
