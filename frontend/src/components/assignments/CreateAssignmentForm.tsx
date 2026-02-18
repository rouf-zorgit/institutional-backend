'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { FileUpload } from '@/components/ui/file-upload';
import { AssignmentsService } from '@/services/assignments.service';
import { BatchesService, Batch } from '@/services/batches.service';
import { assignmentFormSchema, AssignmentFormValues } from './schema';

export function CreateAssignmentForm() {
    const router = useRouter();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoadingBatches, setIsLoadingBatches] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentFormSchema),
        defaultValues: {
            title: '',
            description: '',
            batch_id: '',
            total_marks: 100,
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

    const onSubmit = async (data: AssignmentFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await AssignmentsService.create({
                ...data,
                deadline: new Date(data.deadline).toISOString(),
            });
            if (response.success) {
                router.push('/assignments');
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to create assignment:', error);
            // Handle error (toast, etc.)
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Assignment Title" {...field} />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Assignment details..."
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="deadline"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Deadline</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(new Date(field.value), "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => field.onChange(date?.toISOString())}
                                            disabled={(date) =>
                                                date < new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="total_marks"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Marks</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="file_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Attachment (Optional)</FormLabel>
                            <FormControl>
                                <FileUpload
                                    category="assignments"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Assignment
                </Button>
            </form>
        </Form>
    );
}
