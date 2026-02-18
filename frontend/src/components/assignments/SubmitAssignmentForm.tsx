"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { FileUpload } from "@/components/ui/file-upload";
import { SubmissionsService } from "@/services/submissions.service";
import { Loader2, Send } from "lucide-react";

const formSchema = z.object({
    file_url: z.string().url("Please upload a file"),
});

interface SubmitAssignmentFormProps {
    assignmentId: string;
    onSuccess?: () => void;
}

export function SubmitAssignmentForm({ assignmentId, onSuccess }: SubmitAssignmentFormProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            file_url: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setMessage(null);
        try {
            await SubmissionsService.create({
                assignment_id: assignmentId,
                file_url: values.file_url,
            });
            setMessage({ type: 'success', text: "Assignment submitted successfully!" });
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Failed to submit assignment:", error);
            setMessage({ type: 'error', text: error.message || "Failed to submit assignment." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="file_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assignment File</FormLabel>
                                <FormControl>
                                    <FileUpload
                                        category="assignments"
                                        value={field.value}
                                        onChange={field.onChange}
                                        label="Upload Assignment"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit Assignment
                    </Button>
                </form>
            </Form>
        </div>
    );
}
