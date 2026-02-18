'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { StudyMaterialsService, MaterialType } from '@/services/study-materials.service';
import { BatchesService, Batch } from '@/services/batches.service';

const formSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    batch_id: z.string().min(1, 'Please select a batch'),
    type: z.nativeEnum(MaterialType, { required_error: 'Please select a type' }),
    file_url: z.string().url('Please upload a file').min(1, 'Please upload a file'),
});

type FormValues = z.infer<typeof formSchema>;

export function UploadStudyMaterialForm() {
    const router = useRouter();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoadingBatches, setIsLoadingBatches] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            batch_id: '',
            file_url: '',
        },
    });

    useEffect(() => {
        async function fetchBatches() {
            try {
                const response = await BatchesService.getAll();
                if (response.success) {
                    setBatches(response.data.batches);
                }
            } catch (error) {
                console.error('Failed to fetch batches:', error);
            } finally {
                setIsLoadingBatches(false);
            }
        }
        fetchBatches();
    }, []);

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const response = await StudyMaterialsService.create(data);
            if (response.success) {
                form.reset();
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to upload material:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4 bg-muted/20">
                <h3 className="font-semibold mb-4">Upload New Material</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Material Title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="batch_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Batch</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a batch" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {batches.map((batch) => (
                                            <SelectItem key={batch.id} value={batch.id}>
                                                {batch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(MaterialType).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="file_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>File</FormLabel>
                                <FormControl>
                                    <FileUpload
                                        category="study-materials"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Details..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload Material
                </Button>
            </form>
        </Form>
    );
}
