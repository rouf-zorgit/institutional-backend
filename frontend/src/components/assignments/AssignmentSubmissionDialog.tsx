'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentSubmissionDialogProps {
    assignmentId: string;
    assignmentTitle: string;
    onSubmit: (file: File) => void;
}

export function AssignmentSubmissionDialog({ assignmentId, assignmentTitle, onSubmit }: AssignmentSubmissionDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [open, setOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleSumbit = () => {
        if (file) {
            onSubmit(file);
            setOpen(false);
            setFile(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Submit Assignment</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Submit: {assignmentTitle}</DialogTitle>
                    <DialogDescription>
                        Upload your assignment file here. Make sure it's in the correct format.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                            file ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        )}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => !file && document.getElementById('assignment-upload')?.click()}
                    >
                        <Input
                            id="assignment-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {file ? (
                            <div className="flex items-center gap-4 w-full">
                                <FileText className="h-10 w-10 text-primary" />
                                <div className="flex-1 text-left overflow-hidden">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                                <p className="text-sm font-semibold">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX or ZIP (max. 10MB)</p>
                            </>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="button" onClick={handleSumbit} disabled={!file}>
                        Upload & Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
