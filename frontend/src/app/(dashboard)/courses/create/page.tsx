import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Category {
    id: string;
    name: string;
}

export default function CreateCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category_id: "",
        regular_price: "",
        offer_price: "",
        duration: "",
        thumbnail_url: "",
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await apiRequest<{ data: Category[] }>("/api/courses/categories");
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiRequest("/api/courses", {
                method: "POST",
                body: JSON.stringify({
                    ...formData,
                    regular_price: Number(formData.regular_price),
                    offer_price: formData.offer_price ? Number(formData.offer_price) : undefined,
                    duration: Number(formData.duration),
                }),
            });
            router.push("/courses");
        } catch (error) {
            console.error("Failed to create course:", error);
            alert("Failed to create course. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Create New Course</h1>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Course Title</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                minLength={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category_id">Category</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                minLength={10}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="regular_price">Regular Price ($)</Label>
                                <Input
                                    id="regular_price"
                                    name="regular_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.regular_price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="offer_price">Offer Price ($) (Optional)</Label>
                                <Input
                                    id="offer_price"
                                    name="offer_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.offer_price}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (weeks)</Label>
                            <Input
                                id="duration"
                                name="duration"
                                type="number"
                                min="1"
                                value={formData.duration}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="thumbnail_url">Thumbnail URL (Optional)</Label>
                            <Input
                                id="thumbnail_url"
                                name="thumbnail_url"
                                type="url"
                                value={formData.thumbnail_url}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Create Course
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
